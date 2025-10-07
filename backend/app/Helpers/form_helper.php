<?php

if (!function_exists('getDenounceData')) {
    function getDenounceData(array $generalAspects, array $previousDenounce, array $ambientalPromises, array $proof): array {

        [$year, $day, $month] = explode('-', $generalAspects['denounceDate']);
    
        return [
            "code" => $generalAspects['code'],
            "reception_media" => $generalAspects['receptionMedia'],
            "date" => $year . '-' . $month . '-' . $day,
            "has_previous_denounce" => (int) $previousDenounce['hasPreviousDenounce'],
            "has_response" => (int) $previousDenounce['hasResponseDenounce'],
            "directed_entity" => $previousDenounce['directedEntity'] ?? 'NO ESPECIFICA',
            "entity_response" => $previousDenounce['entityResponse'] ?? 'NO ESPECIFICA',
            "comunication_media" => $previousDenounce['communicationMedia'] ?? 'NO ESPECIFICA',
            "source" => $previousDenounce['source'] ?? 'NO ESPECIFICA',
            "keep_identity" => (int) $previousDenounce['keepIdentity'],
            "address" => $ambientalPromises['address'] ?? 'NO TIENE',
            "reference" => $ambientalPromises['reference'] ?? 'NO TIENE',
            "facts_description" => $ambientalPromises['factsDescription'] ?? 'NO TIENE',
            "ambiental_promise" => $ambientalPromises['ambientalPromise'] ?? 'NO TIENE',
            "proof_description" => $proof['proofDescription'] ?? 'NO TIENE'
        ];
    }
}

if (!function_exists('getPersonData')) {
    function getPersonData($person): array {

        if (empty($person)) {
            // Retorna valores seguros si no hay datos
            return [
                "id_doc_type" => 1,
                "is_natural_person" => 1,
                "doc_number" => 'SIN DATOS',
                "trade_name" => 'SIN DATOS',
                "name" => 'SIN DATOS',
                "paternal_surname" => 'SIN DATOS',
                "mother_surname" => 'SIN DATOS',
                "legal_representator" => 'SIN DATOS',
                "address" => 'SIN DATOS',
                "fixed_phone" => 'SIN DATOS',
                "first_phone" => 'SIN DATOS',
                "second_phone" => 'SIN DATOS',
                "email" => 'SIN DATOS',
                "departament" => "LAMBAYEQUE",
                "province" => "CHICLAYO",
                "distric" => "JOSE LEONARDO ORTIZ"
            ];
        }

        $isNatural = $person['isNatural'] ?? true;
        $entity = $person['entity'] ?? [];

        $legalRepresentator = $person['legalRepresentator'] ?? '';
        $email = $person['email'] ?? '';
        $fixedPhone = $person['fixedPhone'] ?? '';
        $firstPhone = $person['firstPhone'] ?? '';
        $secondPhone = $person['secondPhone'] ?? '';

        return [
            "id_doc_type" => $isNatural ? 1 : 2,
            "is_natural_person" => (int) $isNatural,
            "doc_number" => $isNatural 
                ? ($entity['dni'] ?? 'SIN DATOS') 
                : ($entity['ruc'] ?? 'SIN DATOS'),
            "trade_name" => $isNatural ? 'NO TIENE' : ($entity['tradeName'] ?? 'SIN DATOS'),
            "name" => $isNatural ? ($entity['name'] ?? 'SIN DATOS') : "NO TIENE",
            "paternal_surname" => $isNatural ? ($entity['paternalSurname'] ?? 'SIN DATOS') : "NO TIENE",
            "mother_surname" => $isNatural ? ($entity['motherSurname'] ?? 'SIN DATOS') : "NO TIENE",
            "legal_representator" => $legalRepresentator === '' ? 'NO ESPECIFICA' : $legalRepresentator,
            "address" => $person['address'] ?? 'SIN DATOS',
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
