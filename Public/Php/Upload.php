<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    require_once 'Functions.php';
	
	require_once 'XLSX/simplexlsx.class.php';
	
	if (preg_array_key_exists('/ProjectId/', $_POST) && isset($_FILES['file']) && count($_FILES['file'])) {
		
		require_once 'DBSettings.php';
		
		$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$Error = false;
		
		$xlsx = new SimpleXLSX($_FILES['file']['tmp_name'][0]);
		
		$sheet = $xlsx->rows(1);
	
		$ColString = array();
	
		$InsertString = array();
	
		$InsertVal = array();

		for ($i = 0; $i < count($sheet[0]); $i ++) {
			
			if ($i < $_POST['AuthCount']) {
				
				array_push($ColString, 'Auth_' . ($i + 1) . ' VARCHAR(255) NULL');
				
				array_push($InsertString, '`Auth_' . ($i + 1) . '`');
				
			} else {
				
				array_push($ColString, 'Data_' . ($i - ($i > 1 ? 1 : 0)) . ' VARCHAR(255) NULL');
				
				array_push($InsertString, '`Data_' . ($i - ($i > 1 ? 1 : 0)) . '`');
				
			}
	
		}
		
		if ($_POST['InsertType'] == '2') {
		
			$CurrentTable = $DBQ -> prep('SHOW TABLES FROM `koksarea_hot' . $_POST['ProjectId'] . '` LIKE "scheme_authorization"') -> fetchAll(PDO :: FETCH_NUM);
			
			if (count($CurrentTable) != 1) $Error = 'Нет таблицы';
		
		} else {

			$DBQ -> prep('DROP TABLE IF EXISTS `scheme_authorization`');

			$DBQ -> prep('CREATE TABLE scheme_authorization (Id SMALLINT(5) NOT NULL UNIQUE PRIMARY KEY AUTO_INCREMENT, ' . implode(',', $ColString) . ') ENGINE=InnoDB');
			
		}
		
		if ($Error === false) {

			$NameArray = array();
			
			$ValArray = array();

			foreach ($sheet as $RowIndex => $Row) {

				foreach ($Row as $ColIndex => $Col) {
					
					array_push($NameArray, ':d_' . $RowIndex . '_' . $ColIndex);
					
					$ValArray['d_' . $RowIndex . '_' . $ColIndex] = $Col;
					
				}
				
				array_push($InsertVal, '(' . implode(',', $NameArray) . ')');
				
				$NameArray = array();

			}
		
			$InsertResult = $DBQ -> prep('INSERT INTO `scheme_authorization` (' . implode(',', $InsertString) . ') VALUES ' . implode(',', $InsertVal), $ValArray);
			
			echo $InsertResult;
			
		} else echo $Error;

	}
	
}

?>