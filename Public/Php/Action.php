<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST' && count($_POST) >= 3 && isset($_POST['ProjectId']) && is_numeric($_POST['ProjectId'])) {
	
	require_once 'Functions.php';

	require_once 'DBSettings.php';
	
	require_once 'Process.php';
	
	$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
	
	$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);
	
	switch ($_POST['Action']) {
		
		case 'UserPasswordChange':
		
			logger('User password hange');
		
			$hash = hash('sha256', $_POST['NewPassword'] . 'mrs.Maysel');
		
			$UserUpdate = $DB -> prep('UPDATE `users` SET `hash` = "' . $hash . '" WHERE `users`.`id` = ' . $_POST['UserId']);
			
			echo json_encode(array('Action' => 'UserPasswordChange', 'Id' => $_POST['UserId'], 'UserIndex' => $_POST['UserIndex'], 'Hash' => $hash));
		
		break;
		
		case 'UserRemove':
		
			logger('User remove');
			
			$UserData = $DBQ -> prep('SELECT * FROM `vscheme` WHERE `Uid` = ' . $_POST['UserId']) -> fetch(PDO :: FETCH_ASSOC);
			
			if ($UserData) {
			
				if ($UserData['Limited'] != null) {
				
					$Limited = explode(',', $UserData['Limited']);
					
					foreach ($Limited as $LV) $DBQ -> prep('UPDATE `lscheme` SET `Contains` = `Contains` - 1 WHERE `Id` = ' . $LV);
				
				}
				
				$UpdateVscheme = $DBQ -> prep('DELETE FROM `vscheme` WHERE `Id` = ' . $UserData['Id']);
				
				$DeleteUserTable = $DBQ -> prep('DROP TABLE u' . $UserData['Uid']);
			
				$DeleteUser = $DB -> prep('DELETE FROM `users` WHERE `users`.`id` = ' . $UserData['Uid']);

				echo json_encode(array('Action' => 'User Remove'));
			
			} else json_encode(array('Action' => 'Fail'));
		
		break;
		
		case 'UserInfo':
		
			$UserInfo = $DBQ -> prep('SELECT * FROM `u' . $_POST['UserId'] . '` ORDER BY `QSI`') -> fetchAll(PDO :: FETCH_ASSOC);
			
			echo json_encode(array('Action' => 'UserInfo', 'UserId' => $_POST['UserId'], 'UserInfo' => $UserInfo, 'UserIndex' => $_POST['UserIndex']));
		
		break;
		
		case 'InsertQ':
		
			$max_qid = $DBQ -> prep('SELECT MAX(`id`) FROM `[q]scheme`') -> fetch(PDO :: FETCH_NUM)[0];

			$After = + $_GET['After'];

			$Col = isset($_GET['Col']) ? + $_GET['Col'] : 1;
		
			$Transit = $DBQ -> prep('SELECT `id`, `Transit`, `AltTransit` FROM `[r]scheme`') -> fetchAll(PDO :: FETCH_ASSOC);

			$NewTransit = array();

			$QueryString = '';

			$Change = false;

			foreach ($Transit as $TransitString) {
				
				foreach ($TransitString as $TRSK => $TRSV) {
					
					if ($TRSK == 'id') $Change = false;
					
					if ($TRSK != 'id') {
						
						if ($TRSV != '') {
						
							$TRSV_A = explode(',', $TRSV);
						
							$TRSV_B = array_map(function($x) {
								
								Global $After, $Col, $Change;
								
								if (is_numeric($x) && + $x > $After) {
									
									$Change = true;
									
									return $x + $Col;
									
								}
									
							}, $TRSV_A);
						
						}
						
						if ($Change) $TransitString[$TRSK] = $TRSV != '' ? implode(',', $TRSV_B) : 'NULL';
						
					}
					
				}
				
				if ($Change) array_push($NewTransit, $TransitString);
				
			}

			if (count($NewTransit)) {
			
				foreach ($NewTransit as $NTV) $QueryString .= '("' . implode('", "', $NTV) . '"),';
				
				$r = $DBQ -> prep('INSERT INTO `[r]scheme` (`id`, `Transit`, `AltTransit`) VALUES ' . substr(str_replace('""', 'NULL', $QueryString), 0, -1) . ' ON DUPLICATE KEY UPDATE Transit = VALUES(Transit), AltTransit = VALUES(AltTransit)');
				
			}
			
			for ($i = $max_qid; $i > $After; $i --) $DBQ -> prep('UPDATE `[q]scheme` SET `id` = ' . ($i + $Col) . ' WHERE `id` = ' . $i);

			for ($j = 1; $j <= $Col; $j ++) $DBQ -> prep('INSERT INTO `[q]scheme` (`id`) VALUES (' . ($After + $j) . ')');
					
		break;
		
	}
	
}

?>