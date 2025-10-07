<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDenounceProcedures extends Migration
{
    public function up()
    {
        // --- Procedimiento: usp_findDenounceForPDFById --- (VERSIÓN CORREGIDA CON ANY_VALUE)
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenounceForPDFById`");
        $sql1 = <<<SQL
        CREATE PROCEDURE `usp_findDenounceForPDFById` (IN `p_id` INT)
        BEGIN
            SELECT 
                ANY_VALUE(d.code) AS code,
                ANY_VALUE(d.reception_media) AS receptionMedia,
                ANY_VALUE(DATE_FORMAT(d.date, '%d-%m-%Y')) AS date,
                ANY_VALUE(d.has_previous_denounce) AS hasPreviousDenounce,
                ANY_VALUE(d.has_response) AS hasResponseDenounce,
                ANY_VALUE(d.directed_entity) AS directedEntity,
                ANY_VALUE(d.entity_response) AS entityResponse,
                ANY_VALUE(d.comunication_media) AS communicationMedia,
                ANY_VALUE(d.source) AS source,
                ANY_VALUE(d.keep_identity) AS keepIdentity,
                ANY_VALUE(P1.is_natural_person) AS denouncer_is_natural,
                ANY_VALUE(P1.doc_number) AS denouncer_doc_number,
                ANY_VALUE(P1.name) AS denouncer_name,
                ANY_VALUE(P1.paternal_surname) AS denouncer_paternal_surname,
                ANY_VALUE(P1.mother_surname) AS denouncer_mother_surname,
                ANY_VALUE(P1.trade_name) AS denouncer_trade_name,
                ANY_VALUE(P1.legal_representator) AS denouncer_legal_representator,
                ANY_VALUE(P1.address) AS denouncer_address,
                ANY_VALUE(P1.fixed_phone) AS denouncer_fixed_phone,
                ANY_VALUE(P1.first_phone) AS denouncer_first_phone,
                ANY_VALUE(P1.second_phone) AS denouncer_second_phone,
                ANY_VALUE(P1.email) AS denouncer_email,
                ANY_VALUE(P2.is_natural_person) AS denounced_is_natural,
                ANY_VALUE(P2.doc_number) AS denounced_doc_number,
                ANY_VALUE(P2.name) AS denounced_name,
                ANY_VALUE(P2.paternal_surname) AS denounced_paternal_surname,
                ANY_VALUE(P2.mother_surname) AS denounced_mother_surname,
                ANY_VALUE(P2.trade_name) AS denounced_trade_name,
                ANY_VALUE(P2.legal_representator) AS denounced_legal_representator,
                ANY_VALUE(P2.address) AS denounced_address,
                ANY_VALUE(P2.fixed_phone) AS denounced_fixed_phone,
                ANY_VALUE(P2.first_phone) AS denounced_first_phone,
                ANY_VALUE(d.address) AS facts_address,
                ANY_VALUE(d.reference) AS facts_reference,
                ANY_VALUE(d.facts_description) AS factsDescription,
                ANY_VALUE(d.ambiental_promise) AS ambientalPromise,
                ANY_VALUE(d.proof_description) AS proofDescription,
                (SELECT GROUP_CONCAT(dac.id_ambiental_cause SEPARATOR ',') 
                 FROM denounce_ambiental_cause dac 
                 WHERE dac.id_denounce = d.id) AS ambientalCauses
            FROM denounce AS d
            LEFT JOIN person_denounce AS PD1 ON d.id = PD1.id_denounce AND PD1.is_affected = 1
            LEFT JOIN person AS P1 ON PD1.id_person = P1.id
            LEFT JOIN person_denounce AS PD2 ON d.id = PD2.id_denounce AND PD2.is_affected = 0
            LEFT JOIN person AS P2 ON PD2.id_person = P2.id
            WHERE d.id = p_id
            GROUP BY d.id;
        END
        SQL;
        $this->db->query($sql1);
        // $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenounceForPDFById`");
        // $sql1 = <<<SQL
        // CREATE PROCEDURE `usp_findDenounceForPDFById` (IN `p_id` INT)
        // BEGIN
        //     SELECT 
        //         d.code, d.reception_media AS receptionMedia, DATE_FORMAT(d.date, '%d-%m-%Y') AS date,
        //         d.has_previous_denounce AS hasPreviousDenounce, d.has_response AS hasResponseDenounce,
        //         d.directed_entity AS directedEntity, d.entity_response AS entityResponse,
        //         d.comunication_media AS communicationMedia, d.source, d.keep_identity AS keepIdentity,
        //         P1.is_natural_person AS denouncer_is_natural, P1.doc_number AS denouncer_doc_number,
        //         P1.name AS denouncer_name, P1.paternal_surname AS denouncer_paternal_surname,
        //         P1.mother_surname AS denouncer_mother_surname, P1.trade_name AS denouncer_trade_name,
        //         P1.legal_representator AS denouncer_legal_representator, P1.address AS denouncer_address,
        //         P1.fixed_phone AS denouncer_fixed_phone, P1.first_phone AS denouncer_first_phone,
        //         P1.second_phone AS denouncer_second_phone, P1.email AS denouncer_email,
        //         P2.is_natural_person AS denounced_is_natural, P2.doc_number AS denounced_doc_number,
        //         P2.name AS denounced_name, P2.paternal_surname AS denounced_paternal_surname,
        //         P2.mother_surname AS denounced_mother_surname, P2.trade_name AS denounced_trade_name,
        //         P2.legal_representator AS denounced_legal_representator, P2.address AS denounced_address,
        //         P2.fixed_phone AS denounced_fixed_phone, P2.first_phone AS denounced_first_phone,
        //         d.address AS facts_address, d.reference AS facts_reference, d.facts_description AS factsDescription,
        //         d.ambiental_promise AS ambientalPromise, d.proof_description AS proofDescription,
        //         (SELECT GROUP_CONCAT(dac.id_ambiental_cause SEPARATOR ',') 
        //          FROM denounce_ambiental_cause dac 
        //          WHERE dac.id_denounce = d.id) AS ambientalCauses
        //     FROM denounce AS d
        //     LEFT JOIN person_denounce AS PD1 ON d.id = PD1.id_denounce AND PD1.is_affected = 1
        //     LEFT JOIN person AS P1 ON PD1.id_person = P1.id
        //     LEFT JOIN person_denounce AS PD2 ON d.id = PD2.id_denounce AND PD2.is_affected = 0
        //     LEFT JOIN person AS P2 ON PD2.id_person = P2.id
        //     WHERE d.id = p_id
        //     GROUP BY d.id;
        // END
        // SQL;
        // $this->db->query($sql1);


        // --- Procedimiento: usp_findDenouncesByOffset ---
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenouncesByOffset`");
        $sql2 = <<<SQL
        CREATE PROCEDURE `usp_findDenouncesByOffset` (IN `p_denouncer_doc_number` VARCHAR(11), IN `p_denounced_doc_number` VARCHAR(11), IN `p_date` DATE, IN `p_denounce_type` VARCHAR(35), IN `p_offset` INT, OUT `p_real_registers` INT)
        BEGIN
            SELECT COUNT(*) INTO p_real_registers
            FROM denounce AS D
            INNER JOIN person_denounce AS PD1 ON D.id = PD1.id_denounce AND PD1.is_affected = 1
            INNER JOIN person AS P1 ON PD1.id_person = P1.id
            INNER JOIN person_denounce AS PD2 ON D.id = PD2.id_denounce AND PD2.is_affected = 0
            INNER JOIN person AS P2 ON PD2.id_person = P2.id
            WHERE (P1.doc_number = p_denouncer_doc_number COLLATE utf8mb4_general_ci OR p_denouncer_doc_number IS NULL)
              AND (D.date = COALESCE(p_date, D.date) OR p_date IS NULL)
              AND ((SELECT DS.type FROM denounce_action AS DA INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id WHERE DA.id_denounce = D.id ORDER BY DA.date DESC LIMIT 1) = p_denounce_type COLLATE utf8mb4_general_ci OR p_denounce_type IS NULL)
              AND (P2.doc_number = p_denounced_doc_number COLLATE utf8mb4_general_ci OR p_denounced_doc_number IS NULL);
            
            SELECT 
                D.id AS idDenounce,
                CASE WHEN P1.is_natural_person = 1 THEN CONCAT(P1.name, ' ', P1.paternal_surname, ' ', P1.mother_surname) WHEN P1.is_natural_person = 0 THEN P1.trade_name ELSE 'Not found denouncer' END AS denouncer,
                P1.doc_number AS denouncerDocNumber,
                CASE WHEN P2.is_natural_person = 1 THEN CONCAT(P2.name, ' ', P2.paternal_surname, ' ', P2.mother_surname) WHEN P2.is_natural_person = 0 THEN P2.trade_name ELSE 'Not found denounced' END AS denounced,
                P2.doc_number AS denouncedDocNumber, D.facts_description AS reason, D.proof_description AS proofDescription,
                DATE_FORMAT(D.date, '%d-%m-%Y') AS date,
                (SELECT DS.type FROM denounce_action AS DA INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id WHERE DA.id_denounce = D.id ORDER BY DA.date DESC LIMIT 1) AS state,
                D.keep_identity AS anonymous
            FROM denounce AS D
            INNER JOIN person_denounce AS PD1 ON D.id = PD1.id_denounce AND PD1.is_affected = 1
            INNER JOIN person AS P1 ON PD1.id_person = P1.id
            INNER JOIN person_denounce AS PD2 ON D.id = PD2.id_denounce AND PD2.is_affected = 0
            INNER JOIN person AS P2 ON PD2.id_person = P2.id
            WHERE (P1.doc_number = p_denouncer_doc_number COLLATE utf8mb4_general_ci OR p_denouncer_doc_number IS NULL)
              AND (D.date = COALESCE(p_date, D.date) OR p_date IS NULL)
              AND ((SELECT DS.type FROM denounce_action AS DA INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id WHERE DA.id_denounce = D.id ORDER BY DA.date DESC LIMIT 1) = p_denounce_type COLLATE utf8mb4_general_ci OR p_denounce_type IS NULL)
              AND (P2.doc_number = p_denounced_doc_number COLLATE utf8mb4_general_ci OR p_denounced_doc_number IS NULL)
            LIMIT 10 OFFSET p_offset;
        END
        SQL;
        $this->db->query($sql2);


        // --- Procedimiento: usp_findDenounceTracking --- (VERSIÓN ACTUALIZADA)
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenounceTracking`");
        $sql3 = <<<SQL
        CREATE PROCEDURE `usp_findDenounceTracking` (
            IN `p_id_denounce` INT, 
            IN `p_is_admin` VARCHAR(8), 
            IN `p_showAll` TINYINT(1)
        )
        BEGIN
            IF (p_showAll = 0) THEN
                IF (p_is_admin COLLATE utf8mb4_general_ci = 'ADMIN') THEN 
                    SELECT 
                        DA.id_denounce AS idDenounce, 
                        DATE_FORMAT(DA.date, '%d-%m-%Y %H:%i:%s') AS date, 
                        DS.type AS state, 
                        DA.description
                    FROM denounce_action AS DA
                    INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
                    WHERE DA.id_denounce = p_id_denounce
                    ORDER BY DA.date DESC
                    LIMIT 1;
                ELSEIF (p_is_admin COLLATE utf8mb4_general_ci = 'CIVIL') THEN
                    SELECT 
                        DA.id_denounce AS idDenounce, 
                        DATE_FORMAT(DA.date, '%d-%m-%Y %H:%i:%s') AS date, 
                        DS.type AS state
                    FROM denounce_action AS DA
                    INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
                    WHERE DA.id_denounce = p_id_denounce
                    ORDER BY DA.date DESC
                    LIMIT 1;
                END IF;
            ELSE 
                IF (p_is_admin COLLATE utf8mb4_general_ci = 'ADMIN') THEN 
                    SELECT 
                        DA.id AS idTracking, 
                        DA.id_denounce AS idDenounce, 
                        DATE_FORMAT(DA.date, '%d-%m-%Y %H:%i:%s') AS date, 
                        DS.type AS state, 
                        DA.description
                    FROM denounce_action AS DA
                    INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
                    WHERE DA.id_denounce = p_id_denounce
                    ORDER BY DA.date DESC;
                ELSEIF (p_is_admin COLLATE utf8mb4_general_ci = 'CIVIL') THEN
                    SELECT 
                        DA.id_denounce AS idDenounce, 
                        DATE_FORMAT(DA.date, '%d-%m-%Y %H:%i:%s') AS date, 
                        DS.type AS state
                    FROM denounce_action AS DA
                    INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
                    WHERE DA.id_denounce = p_id_denounce
                    ORDER BY DA.date DESC;
                END IF;
            END IF;
        END
        SQL;
        $this->db->query($sql3);


        // --- Procedimiento: usp_findDetailDenounce ---
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDetailDenounce`");
        $sql4 = <<<SQL
        CREATE PROCEDURE `usp_findDetailDenounce` (IN `p_id_denounce` INT)
        BEGIN
            DECLARE v_proofs TEXT;
            SELECT GROUP_CONCAT(P.path SEPARATOR ',') INTO v_proofs
            FROM proof AS P
            WHERE P.id_denounce = p_id_denounce;
            SELECT 
                D.code COLLATE utf8mb4_general_ci AS code, D.reception_media COLLATE utf8mb4_general_ci AS receptionMedia, D.date,
                D.has_previous_denounce AS hasPreviousDenounce, D.has_response AS hasResponse, D.directed_entity COLLATE utf8mb4_general_ci AS directedEntity,
                D.entity_response COLLATE utf8mb4_general_ci AS entityResponse, D.comunication_media COLLATE utf8mb4_general_ci AS comunicationMedia,
                D.source COLLATE utf8mb4_general_ci AS source, D.keep_identity AS keepIdentity, D.address COLLATE utf8mb4_general_ci AS address,
                D.reference COLLATE utf8mb4_general_ci AS reference, D.facts_description COLLATE utf8mb4_general_ci AS factsDescription,
                D.ambiental_promise COLLATE utf8mb4_general_ci AS ambientalPromise, D.proof_description COLLATE utf8mb4_general_ci AS proofDescription,
                COALESCE(v_proofs, 'NO PRESENTO PRUEBAS') COLLATE utf8mb4_general_ci AS proofs,
                GROUP_CONCAT(DISTINCT AC.type SEPARATOR ',') COLLATE utf8mb4_general_ci AS ambientalCauses
            FROM denounce AS D
            LEFT JOIN denounce_ambiental_cause AS DAC ON D.id = DAC.id_denounce
            LEFT JOIN ambiental_cause AS AC ON DAC.id_ambiental_cause = AC.id
            WHERE D.id = p_id_denounce
            GROUP BY D.id;
        END
        SQL;
        $this->db->query($sql4);


        // --- Procedimiento: usp_findProofById ---
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findProofById`");
        $sql5 = <<<SQL
        CREATE PROCEDURE `usp_findProofById` (IN `p_id_denounce` INT)
        BEGIN
            SELECT PR.path COLLATE utf8mb4_general_ci AS path
            FROM proof AS PR
            WHERE PR.id_denounce = p_id_denounce;
        END
        SQL;
        $this->db->query($sql5);


        // --- Procedimiento: usp_findPublicInformationByDenounceId ---
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findPublicInformationByDenounceId`");
        $sql6 = <<<SQL
        CREATE PROCEDURE `usp_findPublicInformationByDenounceId` (IN `p_id_denounce` INT)
        BEGIN
            SELECT
                DATE_FORMAT(D.date, '%d-%m-%Y') AS date,
                CASE WHEN P2.is_natural_person = 1 THEN CONCAT(P2.name, ' ', P2.paternal_surname, ' ', P2.mother_surname) WHEN P2.is_natural_person = 0 THEN P2.trade_name ELSE 'Not found denounced' END COLLATE utf8mb4_general_ci AS denouncedName,
                P2.doc_number COLLATE utf8mb4_general_ci AS denouncedDocNumber,
                D.ambiental_promise COLLATE utf8mb4_general_ci AS ambientalPromise,
                P2.is_natural_person AS isNatural
            FROM denounce AS D
            INNER JOIN person_denounce AS PD2 ON D.id = PD2.id_denounce AND PD2.is_affected = 0
            INNER JOIN person AS P2 ON PD2.id_person = P2.id
            WHERE D.id = p_id_denounce;
        END
        SQL;
        $this->db->query($sql6);


        // --- Procedimiento: usp_updateStateDenounce ---
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_updateStateDenounce`");
        $sql7 = <<<SQL
        CREATE PROCEDURE `usp_updateStateDenounce` (IN `p_id` INT, IN `p_newState` INT, IN `p_description` TEXT)
        BEGIN
            INSERT INTO denounce_action(id_denounce, id_denounce_status, description)
            VALUES (p_id, p_newState, p_description COLLATE utf8mb4_general_ci);
        END
        SQL;
        $this->db->query($sql7);
    }

    public function down()
    {
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenounceForPDFById`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenouncesByOffset`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDenounceTracking`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findDetailDenounce`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findProofById`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_findPublicInformationByDenounceId`");
        $this->db->query("DROP PROCEDURE IF EXISTS `usp_updateStateDenounce`");
    }
}
