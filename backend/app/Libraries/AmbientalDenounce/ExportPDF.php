<?php

namespace App\Libraries\AmbientalDenounce;

use Mpdf\Mpdf;

class ExportPDF {

    private $data;

    public function __construct($data) {
        $this->data = $data;
    }

    public function create() {
        $mpdf = new Mpdf();
        $publicDir = getcwd();
        $mpdf->setSourceFile($publicDir . '/resources/AMBIENTAL_DENOUNCE_FORMAT.pdf');

        $mpdf->AddPage();

        $tpl = $mpdf->importPage(1);
        $mpdf->useTemplate($tpl);

        $mpdf->SetFont('Arial', 'N', 8);
        $mpdf->WriteText(71, 46, $this->data['receptionMedia']);
        $mpdf->WriteText(132, 46.3, $this->data['code']);
        $mpdf->WriteText(71, 53.7, $this->data['date']);

        $this->fillDenouncerDataInPDF($mpdf);
        $this->fillDenouncedDataInPDF($mpdf);
        $this->fillPreviousDenouncesDataInPDF($mpdf);
        $this->fillFactsDataInPDF($mpdf);

        $mpdf->AddPage();

        $tpl = $mpdf->importPage(2);
        $mpdf->useTemplate($tpl);

        $this->fillAmbientalPromisesDataInPDF($mpdf);
        $this->fillProofDataInPDF($mpdf);

        $mpdf->Output('new.pdf', \Mpdf\Output\Destination::INLINE);
    }


    private function fillDenouncerDataInPDF(Mpdf $mpdf)
    {

        $baseX1 = 52;
        $baseX2 = 77;

        $baseY1 = 69;
        $baseY2 = 72;

        $isNatural = $this->isNatural($this->data['denouncerDocNumber']);

        if ($isNatural) {
            // CROSS FOR NATURAL
            $mpdf->Line($baseX1, $baseY1, $baseX2, $baseY2);
            $mpdf->Line($baseX1, $baseY2, $baseX2, $baseY1);

            [ $name, $psurname, $msurname ] = explode('-', $this->data['denouncer']);

            $mpdf->WriteText(35, 77.4, $name);
            $mpdf->WriteText(107.5, 77.4, $psurname);
            $mpdf->WriteText(163.7, 77.4, $msurname);
            
            $mpdf->WriteText(58.4, 97.2, $this->data['denouncerDocNumber']);

        } else {
            // CROSS FOR JURIDIC
            $mpdf->Line($baseX1 + 73, $baseY1, $baseX2 + 72, $baseY2);
            $mpdf->Line($baseX1 + 73, $baseY2, $baseX2 + 72, $baseY1);

            $mpdf->WriteText(47.6, 84.5, $this->data['denouncer']);

            $mpdf->WriteText(137.4, 97.8, $this->data['denouncerDocNumber']);

        }

        $mpdf->WriteText(47.6, 90.8, $this->data['denouncerLegalRepresentator']);

        $mpdf->WriteText(34.2, 104.2, $this->data['denouncerAddress']);

        $mpdf->WriteText(44.6, 110.6, 'LAMBAYEQUE');
        $mpdf->WriteText(98.4, 110.6, 'CHICLAYO');
        $mpdf->SetFont('Arial', 'N', 6);
        $mpdf->WriteText(161.2, 110.6, 'JOSE LEONARDO ORTIZ');
        $mpdf->SetFont('Arial', 'N', 8);

        $mpdf->WriteText(44.6, 116.2, $this->data['denouncerFixedPhone']);
        $mpdf->WriteText(100.4, 116.2, $this->data['denouncerFirstPhone']);
        $mpdf->WriteText(161.2, 116.2, $this->data['denouncerSecondPhone']);

        $mpdf->WriteText(44.6, 122.2, $this->data['denouncerEmail']);
    }

    private function fillDenouncedDataInPDF(Mpdf $mpdf)
    {

        $baseX1 = 59;
        $baseX2 = 78;

        $baseY1 = 159;
        $baseY2 = 163;

        $isNatural = $this->isNatural($this->data['denouncedDocNumber']);

        if ($isNatural) {
            // CROSS FOR NATURAL
            $mpdf->Line($baseX1, $baseY1, $baseX2, $baseY2);
            $mpdf->Line($baseX1, $baseY2, $baseX2, $baseY1);

            [ $name, $psurname, $msurname ] = explode('-', $this->data['denounced']);

            $mpdf->WriteText(35, 168.4, $name);
            $mpdf->WriteText(110.8, 168.6, $psurname);
            $mpdf->WriteText(171.6, 168.6, $msurname);

            $mpdf->WriteText(61.8, 186.8, $this->data['denouncedDocNumber']);

        } else {

            // CROSS FOR JURIDIC
            $mpdf->Line($baseX1 + 85, $baseY1, $baseX2 + 88, $baseY2);
            $mpdf->Line($baseX1 + 85, $baseY2, $baseX2 + 87, $baseY1);

            $mpdf->WriteText(46.4, 174.6, $this->data['denounced']);

            $mpdf->WriteText(148.4, 186.8, $this->data['denouncedDocNumber']);

        }

        $mpdf->WriteText(46.6, 180.8, $this->data['denouncedLegalRepresentator']);

        $mpdf->WriteText(33.4, 193.6, $this->data['denouncedAddress']);

        $mpdf->WriteText(43.6, 199.2, 'LAMBAYEQUE');
        $mpdf->WriteText(111.6, 199.6, 'CHICLAYO');
        $mpdf->SetFont('Arial', 'N', 6.4);
        $mpdf->WriteText(167.5, 199.6, 'JOSE LEONARDO ORTIZ');
        $mpdf->SetFont('Arial', 'N', 8);

        $mpdf->WriteText(43.6, 206, $this->data['denouncedFixedPhone']);
        $mpdf->WriteText(111.6, 206.6, $this->data['denouncedFirstPhone']);
        $mpdf->WriteText(167.2, 206, 'NO TIENE');
        
    }

    private function fillPreviousDenouncesDataInPDF(Mpdf $mpdf)
    {

        $mpdf->WriteText(76.6, 133.4, $this->data['hasPreviousDenounce'] === 1 ? 'Si' : 'No');
        $mpdf->WriteText(76.6, 138.6, $this->data['hasResponse'] === 1 ? 'Si' : 'No');

        $mpdf->WriteText(152.6, 133.4, $this->data['directedEntity']);
        $mpdf->WriteText(153, 138.6, $this->data['entityResponse']);

        $mpdf->WriteText(57.6, 144.6, $this->data['comunicationMedia']);
        $mpdf->WriteText(153.4, 144.6, $this->data['source']);

        if ($this->data['keepIdentity'] === 1) {
            $mpdf->Line(101.6, 147.4, 121, 151);
            $mpdf->Line(101.6, 151, 121, 147.4);
        } else {
            $mpdf->Line(154.6, 147.4, 175, 151);
            $mpdf->Line(154.6, 151, 175, 147.4);
        }

    }

    private function fillAmbientalPromisesDataInPDF(Mpdf $mpdf)
    {

        switch ($this->data['ambientalPromise']) {
            case 'agua':
                $mpdf->Line(25, 30, 38.4, 34.4);
                $mpdf->Line(25, 34.4, 38.4, 30);
                break;
            case 'viento':
                $mpdf->Line(123, 30, 136.4, 34.4);
                $mpdf->Line(123.4, 34.6, 136.4, 30);
                break;
            case 'suelo':
                $mpdf->Line(80, 30, 93.4, 34.4);
                $mpdf->Line(80, 34.4, 93.4, 30);
                break;
            case 'ruido':
                $mpdf->Line(169, 30, 184.6, 34.4);
                $mpdf->Line(169, 34.4, 184.6, 30);
                break;
        }

        //AMBIENTAL IMPACT CROSSES

        $ambientalCauses = explode(',', $this->data['ambientalCauses']);

        if (in_array(1, $ambientalCauses)) {
            $mpdf->Line(79, 44.6, 93.2, 48);
            $mpdf->Line(79, 48, 93.2, 44.6);
        }

        if (in_array(2, $ambientalCauses)) {
            $mpdf->Line(79, 48.6, 93.2, 52);
            $mpdf->Line(79, 52, 93.2, 48.6);
        }

        if (in_array(3, $ambientalCauses)) {
            $mpdf->Line(79, 52.6, 93.2, 56);
            $mpdf->Line(79, 56, 93.2, 52.6);
        }

        if (in_array(4, $ambientalCauses)) {
            $mpdf->Line(170, 44.6, 185, 48.6);
            $mpdf->Line(170, 48.6, 185, 44.6);
        }

        if (in_array(5, $ambientalCauses)) {
            $mpdf->Line(169.6, 49.2, 185, 53);
            $mpdf->Line(169.6, 53, 185, 49.2);
        }

    }

    private function fillFactsDataInPDF(Mpdf $mpdf)
    {
        $mpdf->WriteText(43.6, 225.6, $this->data['factsAddress']);
        $mpdf->WriteText(43.6, 231.6, $this->data['factsReference']);
        $mpdf->SetXY(15, 236.6);
        $mpdf->MultiCell(185, 4, $this->data['factsDescription'], 0, 'J');
    }

    private function fillProofDataInPDF(Mpdf $mpdf) {
        $mpdf->SetXY(16.6, 70.6);

        $proofDescription = $this->data['proofDescription'] === "" ? "NO ESPECIFICA" : $this->data['proofDescription'];

        $mpdf->MultiCell(180, 4, $proofDescription, 0, 'J');
    }

    private function isNatural(int $docNumber): int {
        return strlen($docNumber) === 8;
    }

}