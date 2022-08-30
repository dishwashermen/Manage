<?php

function GetBaseData($data) {
	
	global $DBQ;
	
	$BaseData = $DBQ -> prep('SELECT `Auth_1`' . ($data == 2 ? ', `Auth_2`' : '') . ' FROM `scheme_authorization`') -> fetchAll(PDO :: FETCH_NUM);
	
	$Result = array('FieldName' => array(), 'FieldData' => array());

	foreach ($BaseData as $Key => $Val) if ($Key > 0) {

		if (! array_key_exists($Val[0], $Result['FieldData'])) $Result['FieldData'][$Val[0]] = array();
	
		if ($data == 2) array_push($Result['FieldData'][$Val[0]], $Val[1]);

	} else {
				
		$Result['FieldName'][0] = $Val[0];
				
		if ($data == 2) $Result['FieldName'][1] = $Val[1];
				
	}

	return $Result;
	
}

?>