<?php 

require('xlsxwriter.class.php');

$fname='my_1st_php_excel_workbook.xlsx';
$header1 = [ 'create_date' => 'date',
		  'quantity' => 'string',
		  'product_id' => 'string',
		  'amount' => 'money',
		  'description' => 'string' ];
$data1 = [ ['2021-04-20', 1, 27, '44.00', 'twig'],
		['2021-04-21', 1, '=C1', '-44.00', 'refund'] ];
// $data2 = [ ['2','7','ᑌᑎIᑕᗝᗪᗴ ☋†Ϝ-➑'],
		// ['4','8','??'] ];
// $styles2 = array( ['font-size'=>6, 'fill'=>'#ff0000'],['font-size'=>8],['font-size'=>10],['font-size'=>16] );

$writer = new XLSXWriter();
$writer->setAuthor('Your Name Here');
$writer->writeSheet($data1,'MySheet1', $header1);  // with headers
// $writer->writeSheet($data2,'MySheet2');            // no headers
// $writer->writeSheetRow('Sheet1', $rowdata = array(300,234,456,789), $styles2 );

// $writer->writeToFile($fname);   // creates XLSX file (in current folder) https://hotresearch.ru/ONLINE/XLSX/XlsxWrite.php
// echo "Wrote $fname (".filesize($fname)." bytes)<br>";

// ...or instead of creating the XLSX you can just trigger a
// download by replacing the last 2 lines with:

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="'.$fname.'"');
header('Cache-Control: max-age=0');
$writer->writeToStdOut();
 
 ?>