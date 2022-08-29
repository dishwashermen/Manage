<?php

function GetFileData($data) {
	
	$in_data = array();
				
	$in_data_index = 0;
	
	foreach ($data as $lkey => $lval) {
		
		$ldata = explode(';', $lval); 
		
		foreach ($ldata as $ldata_key => $ldata_value) {
		
			if ($lkey != 0) {
					
				if ($lkey > 1 && $ldata_key == 0) {
					
					if (! in_array($ldata_value, $in_data[$ldata_key]['fieldData'][$in_data_index])) {
				
						$in_data_index ++;
						
						array_push($in_data[$ldata_key]['fieldData'], array($ldata_value));
						
						if (count($ldata) > 1) for ($i = 1; $i < count($ldata); $i ++) array_push($in_data[$ldata_key + $i]['fieldData'], array());
				
					}
					
				} else array_push($in_data[$ldata_key]['fieldData'][$in_data_index], $ldata_value);

			} else array_push($in_data, array('fieldName' => $ldata_value, 'fieldData' => array(array())));
			
		} 
			
	}
	
	return $in_data;
	
}

?>