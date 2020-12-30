<?php

require '../lib/phpspreadsheet/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Description of Excel
 *
 * @author Doglas
 */
class Excel {
    public static function createExcel(array $data, array $headers = [], $fileName = 'data.xlsx',$bold_rows = array()){
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $styleArrayFirstRow = [
            'font' => [
                'bold' => true,
            ]
        ];
        
        
        
        for ($i = 0, $l = sizeof($headers); $i < $l; $i++) {
            $sheet->setCellValueByColumnAndRow($i + 1, 1, $headers[$i]);
        } 

        for ($i = 0, $l = sizeof($data); $i < $l; $i++) { // row $i
            $j = 0;
            foreach ($data[$i] as $k => $v) { // column $j
                $sheet->setCellValueByColumnAndRow($j + 1, ($i + 1 + 1), $v);
                $j++;
            }
        }
        // By Doglas
        if(sizeof($bold_rows) > 0){
           $highestColumn = $sheet->getHighestColumn();
           
           foreach ($bold_rows as $FILA) {
               $sheet->getStyle('A'.$FILA.':' . $highestColumn .''.$FILA.'' )->applyFromArray($styleArrayFirstRow);
           } 
           
        }
        
        
        $writer = new Xlsx($spreadsheet);
         
        $writer->save($fileName);
    }
}
