<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    require_once 'Functions.php';
	
	if (count($_POST) == 1 && isset($_POST['Login']) && strlen($_POST['Login']) == 32) {
		
		require_once 'DBSettings.php';
		
		$DB = new DBWORKER($dbu['host'], $dbu['db'], 'utf8', $dbu['user'], $dbu['pass']);
		
		$Hash = hash('sha256', $_POST['Login'] . 'mrs.Maysel');
		
		$AdminData = $DB -> prep('SELECT * FROM `adm` WHERE `adm`.`Login` = :Login', array('Login' => $Hash)) -> fetch(PDO :: FETCH_ASSOC);
		
		if ($AdminData) {
			
			$Projects = $DB -> prep('SELECT * FROM `projects`' . ($AdminData['Company'] ? ' WHERE (`projects`.`Company` = ' . implode(' OR `projects`.`Company` = ', explode(',', $AdminData['Company'])) . ')' : '') . ($AdminData['Projects'] ? ($AdminData['Company'] ? 'AND ' : ' WHERE ') . '(`projects`.`id` = ' . implode(' OR `projects`.`id` = ', explode(',', $AdminData['Projects'])) . ')' : '')) -> fetchAll(PDO :: FETCH_ASSOC);

			echo json_encode(array('Action' => 'Logn successful', 'Projects' => $Projects, 'Id' => $AdminData['Id'], 'Status' => $AdminData['Status']));
			
		}
		
	}
	
}

?>