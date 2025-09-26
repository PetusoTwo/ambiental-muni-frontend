<?php

if (!function_exists('getDenounceData')) {
    function getDenounceData(array $generalAspects, array $previousDenounce, array $ambientalPromises, array $proof): array {

        [ $year, $day, $month ] = explode('-', $generalAspects['denounceDate']);
    
        return [
            "code" => $generalAspects['code'],
            "reception_media" => $generalAspects['receptionMedia'],
            "date" => $year.'-'.$month.'-'.$day,
            "has_previous_denounce" => (int) $previousDenounce['hasPreviousDenounce'],
            "has_response" =>  (int) $previousDenounce['hasResponseDenounce'],
            "directed_entity" => $previousDenounce['directedEntity'],
            "entity_response" => $previousDenounce['entityResponse'],
            "comunication_media" => $previousDenounce['communicationMedia'],
            "source" => $previousDenounce['source'],
            "keep_identity" =>  (int) $previousDenounce['keepIdentity'],
            "address" => $ambientalPromises['address'],
            "reference" => $ambientalPromises['reference'],
            "facts_description" => $ambientalPromises['factsDescription'],
            "ambiental_promise" => $ambientalPromises['ambientalPromise'],
            "proof_description" => $proof['proofDescription']
        ];
    
    }
}

if (!function_exists('getPersonData')) {
    function getPersonData($person): array {

        $isNatural = $person['isNatural'];
        $entity = $person['entity'];

        $legalRepresentator = $person['legalRepresentator'];
        $email = $person['email'];
        $fixedPhone = $person['fixedPhone'];
        $firstPhone = $person['firstPhone'];
        $secondPhone = $person['secondPhone'];

        return [
            "id_doc_type" => $isNatural ? 1 : 2,
            "is_natural_person" => (int) $isNatural,
            "doc_number" => $isNatural ? $entity['dni'] : $entity['ruc'],
            "trade_name" => $isNatural ? 'NO TIENE' : $entity['tradeName'],
            "name" => $isNatural ? $entity['name'] : "NO TIENE",
            "paternal_surname" => $isNatural ? $entity['paternalSurname'] : "NO TIENE",
            "mother_surname" => $isNatural ? $entity['motherSurname'] : "NO TIENE",
            "legal_representator" => $legalRepresentator === '' ? 'NO ESPECIFICA' : $legalRepresentator,
            "address" => $person['address'],
            "fixed_phone" => $fixedPhone === '' ? 'NO TIENE' : $fixedPhone,
            "first_phone" => $firstPhone === '' ? 'NO TIENE' : $firstPhone,
            "second_phone" => $secondPhone === '' ? 'NO TIENE' : $secondPhone,
            "email" => $email === '' ? 'NO TIENE' : $email,
            "departament" => "LAMBAYEQUE",
            "province" => "CHICLAYO",
            "distric" => "JOSE LEONARDO ORTIZ"
        ];

    }
}

if (!function_exists('getPersonDenounceData')) {
    function getPersonDenounceData(int $idDenounce, int $idPerson, int $isAffected): array {

        return [
            "id_person" => $idPerson,
            "id_denounce" => $idDenounce,
            "is_affected" => (int) $isAffected
        ];

    }
}