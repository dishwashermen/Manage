<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ProjectId']) && is_numeric($_POST['ProjectId'])) {

	require_once 'Functions.php';

	require_once 'DBSettings.php';
	
	require_once 'Process.php';
	
	$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
	
	$DBQ = new DBWORKER($dbu['host'], 'koksarea_hot' . $_POST['ProjectId'], 'utf8', $dbu['user'], $dbu['pass']);

	$ViewData = $DBQ -> prep('SELECT * FROM `vscheme`') -> fetchAll(PDO :: FETCH_ASSOC);

	$SendArray = array('Action' => 'Project data', 'ProjectId' => $_POST['ProjectId'], 'ViewData' => $ViewData);
	
	if (isset($_POST['Limiting']) && $_POST['Limiting'] == 'ON') {
		
		$LimitData = $DBQ -> prep('SELECT * FROM `lscheme`') -> fetchAll(PDO :: FETCH_ASSOC);
		
		$SendArray['LimitData'] = $LimitData;
		
	}
	
	if (Preg_match('/file/', $_POST['AuthType'])) {

		$fileName = '../../../ONLINE/FileData/data_' . $_POST['ProjectId'];
					
		$FileData = null;
		
		if (file_exists($fileName)) {
						
			$lines = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

			$FileData = GetFileData($lines);
		
		}
		
		$SendArray['FileData'] = $FileData;

	}
		
	echo json_encode($SendArray);
		
}

?>
