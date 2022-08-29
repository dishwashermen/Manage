<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && count($_GET) >= 2 && isset($_GET['p']) && is_numeric($_GET['p']) && isset($_GET['s']) && is_numeric($_GET['s'])) {

	require_once 'Functions.php';

	require_once 'DBSettings.php';
	
	$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
	
	$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_GET['p'], 'utf8', $dbu['user'], $dbu['pass']);

	if (! isset($_GET['jf'])) $maxindex = $DBQ -> prep('SELECT max(`id`) from `qscheme` WHERE `Journal` IS NULL') -> fetch(PDO :: FETCH_NUM)[0];
	
	else $maxindex = + $_GET['jf'] - 1;

	$R = GetR(1, $maxindex);
	
	$ROUT = $R['Result'];
	
	if (isset($_GET['jf'])) {
		
		for ($ijc = 1; $ijc <= $_GET['jc']; $ijc ++) {
		
			$ROUT = array_merge($ROUT, GetR($_GET['jf'], $_GET['jl'], $ijc)); 
			
		}
			
	}

	$RowName = array('Дата' => 'string', 'Логин' => 'string'); 	// Название вопроса
	
	$RowCol = array('', ''); 					// Столбец

	$RowRow = array('', '');					// Строка
	
	$RowNum = array('', '');					// Номер вопроса
	
	$Offset = 2;
	
	if (isset($_GET['ef'])) {
		
		$RegEF = explode('*', $_GET['ef']);
		
		foreach ($RegEF as $RAV) {
			
			$RowName[$RAV] = 'string';
			
			array_push($RowCol, '');
			
			array_push($RowRow, '');
			
			array_push($RowNum, '');
			
			$Offset ++;
			
		}
		
	}
	
	$QN = Array();

	foreach($ROUT as $Q) {
		
		$ICOL = 0;
		
		foreach($Q as $QK => $QV) {

			array_push($QN, $QK);
		
			array_push($RowNum, $QK);

			foreach ($QV as $QVK => $QVV) {
			
				if ($QVK == 'Name') $RowName[$QVV . ' (' . (count($Q) - $ICOL) . ')'] = 'string';
			
				if ($QVK == 'Col') array_push($RowCol, $QVV);

				if ($QVK == 'Row') array_push($RowRow, $QVV);
	
			}
			
			$ICOL ++;

		}

	}

	$DocRows = Array($RowCol, $RowRow, $RowNum);
		
	$Filter = Array();

	foreach ($_GET as $key => $val) if (! Preg_match('/^p$|^s$|^jf$|^jl$|^jc$|^ef$/', $key)) $Filter[$key] = $val;
	
	$a = array('prid' => $_GET['p']);
	
	if ($_GET['s'] > 0) $a['Status'] = $_GET['s'];

	$Users = $DB -> prep('SELECT `id`, `data1`, `TimeStamp` FROM `users` WHERE `prid` = :prid' . ($_GET['s'] > 0 ? ' AND `Status` = :Status' : ''), $a) -> fetchAll(PDO :: FETCH_ASSOC);
	
	$Project = $DB -> prep('SELECT * FROM `projects` WHERE `id` = :prid', array('prid' => $_GET['p'])) -> fetch(PDO :: FETCH_ASSOC);
	
	foreach ($Users as $UV) {
		
		if ($Project['Version'] == 'Online') {
		
			$UserData = $DBQ -> prep('SELECT `QName`, `QResponse` FROM `u' . $UV['id'] . '` ORDER BY `Journal`, `QSI`') -> fetchAll(PDO :: FETCH_ASSOC);

			$UD = Array();
			
			foreach ($UserData as $UDV) $UD[$UDV['QName']] = $UDV['QResponse'];
			
			if (count($Filter)) {
				
				$Correct = true;
			
				foreach ($Filter as $FK => $FV) if (! isset($UD[$FK]) || $UD[$FK] != $FV) $Correct = false;
					
				if ($Correct === false) continue;
		
			}

			$RowUserData = array($UV['TimeStamp'], $UV['data1']);
			
			if (isset($_GET['ef'])) foreach ($RegEF as $RAV) array_push($RowUserData, (isset($UD[$RAV]) ? $UD[$RAV] : ''));

			foreach ($QN as $QNV) array_push($RowUserData, (isset($UD[$QNV]) ? $UD[$QNV] : ''));

			array_push($DocRows, $RowUserData);
		
		} else {

			$UserResultTables = $DB -> prep('SELECT GROUP_CONCAT(table_name) AS data FROM information_schema.tables WHERE table_schema = "koksarea_hot' . $_GET['p'] . '" AND table_name LIKE "u' . $UV['id'] . '_%"') -> fetch(PDO :: FETCH_ASSOC);
			
			$UserTables = explode(',', $UserResultTables['data']);

			foreach ($UserTables as $UTV) {
				
				$UserData = $DBQ -> prep('SELECT `QName`, `QResponse` FROM `' . $UTV . '` ORDER BY `Journal`, `QSI`') -> fetchAll(PDO :: FETCH_ASSOC);

				$UD = Array();
				
				foreach ($UserData as $UDV) $UD[$UDV['QName']] = $UDV['QResponse'];
				
				$RowUserData = array($UV['TimeStamp']);
				
				if (isset($_GET['f']) && isset($RegF[0])) array_push($RowUserData, $UV['data1']);
				
				if (isset($_GET['f']) && isset($RegF[1])) array_push($RowUserData, $UV['data2']);

				if (isset($_GET['a'])) foreach ($RegA as $RAV) array_push($RowUserData, (isset($UD[$RAV]) ? $UD[$RAV] : ''));
				
				foreach ($QN as $QNV) array_push($RowUserData, (isset($UD[$QNV]) ? $UD[$QNV] : ''));

				array_push($DocRows, $RowUserData);
				
			}
			
		}
		
	}
	
	require('XLSX/xlsxwriter.class.php');
	
	$CurrentDate = date("d.m.Y - H.i");
	
	$Total = '(' . (count($DocRows) - 3) . ')';

	$fname = 'REPORT (' . $CurrentDate . ') ' . preg_replace('/,\s+|,/', ' ', $Project['Name']) . '.xlsx';
	
	$SheetName = $Project['Name'] . ' ' . $Total;
			
	$writer = new XLSXWriter();
	
	$writer -> setAuthor('Hotresearch');
	
	$NameStyle = array('fill' => '#555', 'color' => '#fff', 'border' => 'left,right,top,bottom', 'border_color' => '#fff');
	
	$TableStyle = array('fill' => '#c6e0b4', 'border' => 'bottom');
	
	$writer -> writeSheetHeader($SheetName, $RowName, $NameStyle);
	
	foreach ($DocRows as $i => $row) {
		
		if ($i < 3) $writer -> writeSheetRow($SheetName, $rowdata = $row, $TableStyle);
		
		else $writer -> writeSheetRow($SheetName, $rowdata = $row);
		
	}
	
	$styles1 = array( 'border'=>'left,right,top,bottom');
	
	foreach ($R['SIndex'] as $Interval) {
		
		$writer -> markMergedCell($SheetName, $start_row = 0, $start_col = $Interval[0] + $Offset, $end_row = 0, $end_col = $Interval[1] + $Offset);
		
		//$writer -> writeSheetRow($SheetName, $rowdata = array(0, $Interval[0] + $Offset, 0, $Interval[1] + $Offset), $styles1);
		
	}

	header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	
	header('Content-Disposition: attachment;filename="' . $fname . '"');
	
	header('Cache-CoRowUserDataol: max-age=0');
	
	$writer->writeToStdOut();

}

function GetR($Start, $Finish, $Journal = 0) {
	
	Global $DBQ;
	
	$Result = Array();
	
	$SIndex = Array();
	
	for ($ind = $Start, $ti = 0; $ind <= $Finish; $ind++) {
		
		$Q = Array();
		
		$a = $DBQ -> prep('SELECT * FROM `qscheme` WHERE `qscheme`.`id` = :index', array('index' =>  $ind)) -> fetch(PDO :: FETCH_ASSOC);
		
		$Num = $a['Num'] ? preg_replace('/\./', '_', $a['Num']) : false;
		
		$InputType = $a['InputType'] ? $a['InputType'] : false;

		if ($Num && $InputType) {
			
			$R = Array();
			
			$ColsData = $a['ColsContent'] ? explode('|', $a['ColsContent']) : false;

			$RowsData = $a['RowsContent'] ? explode('|', $a['RowsContent']) : false;
				
			if ($Journal > 0) $Num = $Journal . '-' . $Num;
			
			if ($a['OutMark']) { // Строки - столбцы
			
				if ($RowsData) { // Если есть строки
				
					if (($InputType != 'radio' && $InputType != 'checkbox') || count($ColsData) > 2) $SelectIndex = Array($ti);
				
					foreach ($RowsData as $RN => $RV) {
						
						$RV = preg_replace('/\[.+\]|\{.+\}/', '', $RV);
							
						if ($ColsData) { // Если есть столбцы

							$ColsString = Array();

							foreach ($ColsData as $CN => $CV) {
								
								if ($CN > 0) { // Нулевой столбец пропускается
								
									$CV = preg_replace('/\[.+\]|\{.+\}/', '', $CV);
								
									if ($InputType == 'radio' || $InputType == 'checkbox') {  // Номер строки учитыватся, номер столбца не учитывается, но пишется
									
										$ColsString[] = $CN . ' ' . $CV;
									
									} else { // Номер строки учитыватся, номер столбца учитывается
										
										$R[$Num . '_' . ($RN + 1) . '_' . $CN] = array('Name' => $a['TableContent'], 'Col' => $CV, 'Row' => $RV);
										
										$ti ++;
										
									}
								
								}
							
							}
							
							if ($InputType == 'radio' || $InputType == 'checkbox') {
								
								$R[$Num . '_' . ($RN + 1)] = array('Name' => $a['TableContent'], 'Col' => implode(',', $ColsString), 'Row' => $RV);
								
								$ti ++;
								
							}
	
						} else { // Если нет столбцов
							
							
							
						}

					}
					
					if (($InputType != 'radio' && $InputType != 'checkbox') || count($ColsData) > 2) array_push($SelectIndex, $ti - 1);
				
				} else { // Если нет строк
		
					
					
				}
			
			} else { // Столбцы - строки
				
				if ($ColsData) { // Если есть столбцы
				
					if (($InputType != 'radio' && $InputType != 'checkbox') || count($ColsData) > 2) $SelectIndex = Array($ti);
				
					foreach ($ColsData as $CN => $CV) {
						
						if ($CN > 0) { // Нулевой столбец пропускается
						
							$CV = preg_replace('/\[.+\]|\{.+\}/', '', $CV);
							
							if ($RowsData) { // Если есть строки
							
								$RowsString = Array();

								foreach ($RowsData as $RN => $RV) {
									
									$RV = preg_replace('/\[.+\]|\{.+\}/', '', $RV);
								
									if ($InputType == 'radio' || $InputType == 'checkbox') {  // Номер столбца учитыватся, номер строки не учитывается, но пишется
									
										$RowsString[] = ($RN + 1) . ' ' . $RV;
									
									} else { // Номер столбца учитыватся, номер строки учитывается
										
										$R[$Num . (count($ColsData) > 2 ? '_' . $CN : '') . '_' . ($RN + 1)] = array('Name' => $a['TableContent'], 'Col' => $CV, 'Row' => $RV);
										
										$ti ++;
										
									}
								
								}
								
								if ($InputType == 'radio' || $InputType == 'checkbox') {
									
									$R[$Num . (count($ColsData) > 2 ? '_' . $CN : '')] = array('Name' => $a['TableContent'], 'Col' => $CV, 'Row' => implode(',', $RowsString));
									
									$ti ++;
									
								}
								
							} else { // Если нет строк
								
								
								
							}
							
						}
						
					}
					
					if (($InputType != 'radio' && $InputType != 'checkbox') || count($ColsData) > 2) array_push($SelectIndex, $ti - 1);
				
				} else { // Если нет столбцов
					
					if ($RowsData) { // Если есть строки
						
						$RowsString = Array();
						
						if ($InputType != 'radio' && $InputType != 'checkbox') $SelectIndex = Array($ti);
						
						foreach ($RowsData as $RN => $RV) {
							
							$RV = preg_replace('/\[.+\]|\{.+\}/', '', $RV);
						
							if ($InputType == 'radio' || $InputType == 'checkbox') { // Номер строки не учитывается, но пишестя
								
								$RowsString[] = ($RN + 1) . ' ' . $RV;
									
							} else { // Номер строки учитывается

								$R[$Num . '_' . ($RN + 1)] = array('Name' => $a['TableContent'], 'Col' => '', 'Row' => $RV);
								
								$ti ++;
									
							}
							
						}
						
						if ($InputType == 'radio' || $InputType == 'checkbox') {
							
							$R[$Num] = array('Name' => $a['TableContent'], 'Col' => '', 'Row' => implode(',', $RowsString));
							
							$ti ++;
							
						} else array_push($SelectIndex, $ti - 1);

					} else { // Если нет строк
					
						$RowsString = Array();
					
						if ($a['InputData']) {

							$RowsStringData = explode('|', $a['InputData']);
							
							foreach ($RowsStringData as $RSN => $RSV) $RowsString[] = ($RSN + 1) . ' ' . preg_replace('/\[.+\]|\{.+\}/', '', $RSV);
							
						}
						
						$R[$Num] = array('Name' => $a['TableContent'], 'Col' => '', 'Row' => (count($RowsString) ? implode(',', $RowsString) : ''));
						
						$ti ++;
						
					}
					
				}
	
			}
			
			$Q = array_merge($Q, $R);
			
			if (isset($SelectIndex)) {
				
				array_push($SIndex, $SelectIndex);
				
				unset($SelectIndex);
				
			}
				
		}
		
		array_push($Result, $Q);

	}
	
	return Array('Result' => $Result, 'SIndex' => $SIndex);
	
}

?>