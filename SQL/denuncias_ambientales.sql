-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-10-2025 a las 05:26:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `denuncias_ambientales`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findDenounceForPDFById` (IN `p_id` INT)   BEGIN
    SELECT 
        -- Aspectos Generales de la Denuncia
        d.code,
        d.reception_media AS receptionMedia,
        DATE_FORMAT(d.date, '%d-%m-%Y') AS date,
        d.has_previous_denounce AS hasPreviousDenounce,
        d.has_response AS hasResponseDenounce,
        d.directed_entity AS directedEntity,
        d.entity_response AS entityResponse,
        d.comunication_media AS communicationMedia,
        d.source,
        d.keep_identity AS keepIdentity,
        
        -- Datos del Denunciante
        P1.is_natural_person AS denouncer_is_natural, 
        P1.doc_number AS denouncer_doc_number,
        P1.name AS denouncer_name,
        P1.paternal_surname AS denouncer_paternal_surname,
        P1.mother_surname AS denouncer_mother_surname,
        P1.trade_name AS denouncer_trade_name,
        P1.legal_representator AS denouncer_legal_representator,
        P1.address AS denouncer_address,
        P1.fixed_phone AS denouncer_fixed_phone,
        P1.first_phone AS denouncer_first_phone,
        P1.second_phone AS denouncer_second_phone,
        P1.email AS denouncer_email,
        
        -- Datos del Denunciado 
        P2.is_natural_person AS denounced_is_natural, 
        P2.doc_number AS denounced_doc_number,
        P2.name AS denounced_name,
        P2.paternal_surname AS denounced_paternal_surname,
        P2.mother_surname AS denounced_mother_surname,
        P2.trade_name AS denounced_trade_name,
        P2.legal_representator AS denounced_legal_representator,
        P2.address AS denounced_address,
        P2.fixed_phone AS denounced_fixed_phone,
        P2.first_phone AS denounced_first_phone,
        
        -- Hechos y Promesas Ambientales
        d.address AS facts_address,
        d.reference AS facts_reference,
        d.facts_description AS factsDescription,
        d.ambiental_promise AS ambientalPromise,
        
        -- Pruebas y Causas Ambientales
        d.proof_description AS proofDescription,
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findDenouncesByOffset` (IN `p_denouncer_doc_number` VARCHAR(11), IN `p_denounced_doc_number` VARCHAR(11), IN `p_date` DATE, IN `p_denounce_type` VARCHAR(35), IN `p_offset` INT, OUT `p_real_registers` INT)   BEGIN
    -- Contar registros que cumplen filtros
    SELECT COUNT(*) INTO p_real_registers
    FROM denounce AS D
    INNER JOIN person_denounce AS PD1 ON D.id = PD1.id_denounce AND PD1.is_affected = 1
    INNER JOIN person AS P1 ON PD1.id_person = P1.id
    INNER JOIN person_denounce AS PD2 ON D.id = PD2.id_denounce AND PD2.is_affected = 0
    INNER JOIN person AS P2 ON PD2.id_person = P2.id
    WHERE (P1.doc_number = p_denouncer_doc_number COLLATE utf8mb4_general_ci OR p_denouncer_doc_number IS NULL)
      AND (D.date = COALESCE(p_date, D.date) OR p_date IS NULL)
      AND ((SELECT DS.type 
            FROM denounce_action AS DA
            INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
            WHERE DA.id_denounce = D.id
            ORDER BY DA.date DESC 
            LIMIT 1) = p_denounce_type COLLATE utf8mb4_general_ci OR p_denounce_type IS NULL)
      AND (P2.doc_number = p_denounced_doc_number COLLATE utf8mb4_general_ci OR p_denounced_doc_number IS NULL);

    -- Seleccionar registros con paginación
    SELECT 
        D.id AS idDenounce,
        CASE
            WHEN P1.is_natural_person = 1 
                THEN CONCAT(P1.name, ' ', P1.paternal_surname, ' ', P1.mother_surname)
            WHEN P1.is_natural_person = 0 
                THEN P1.trade_name
            ELSE 'Not found denouncer'
        END AS denouncer,
        P1.doc_number AS denouncerDocNumber,
        CASE
            WHEN P2.is_natural_person = 1 
                THEN CONCAT(P2.name, ' ', P2.paternal_surname, ' ', P2.mother_surname)
            WHEN P2.is_natural_person = 0 
                THEN P2.trade_name
            ELSE 'Not found denounced'
        END AS denounced,
        P2.doc_number AS denouncedDocNumber,
        D.facts_description AS reason,
        D.proof_description AS proofDescription,
        DATE_FORMAT(D.date, '%d-%m-%Y') AS date,
        (SELECT DS.type 
         FROM denounce_action AS DA
         INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
         WHERE DA.id_denounce = D.id
         ORDER BY DA.date DESC 
         LIMIT 1) AS state,
         D.keep_identity AS anonymous
    FROM 
        denounce AS D
    INNER JOIN 
        person_denounce AS PD1 ON D.id = PD1.id_denounce AND PD1.is_affected = 1
    INNER JOIN 
        person AS P1 ON PD1.id_person = P1.id
    INNER JOIN 
        person_denounce AS PD2 ON D.id = PD2.id_denounce AND PD2.is_affected = 0
    INNER JOIN 
        person AS P2 ON PD2.id_person = P2.id
    WHERE 
        (P1.doc_number = p_denouncer_doc_number COLLATE utf8mb4_general_ci OR p_denouncer_doc_number IS NULL)
        AND (D.date = COALESCE(p_date, D.date) OR p_date IS NULL)
        AND ((SELECT DS.type 
              FROM denounce_action AS DA
              INNER JOIN denounce_status AS DS ON DA.id_denounce_status = DS.id
              WHERE DA.id_denounce = D.id
              ORDER BY DA.date DESC 
              LIMIT 1) = p_denounce_type COLLATE utf8mb4_general_ci OR p_denounce_type IS NULL)
        AND (P2.doc_number = p_denounced_doc_number COLLATE utf8mb4_general_ci OR p_denounced_doc_number IS NULL)
    LIMIT 10 OFFSET p_offset;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findDenounceTracking` (IN `p_id` INT, IN `p_consultant` VARCHAR(20), IN `p_showAll` BOOLEAN)   BEGIN
    IF (p_consultant COLLATE utf8mb4_general_ci = 'ADMIN' AND p_showAll) THEN
        SELECT 
            da.id AS idTracking,
            d.id AS idDenounce,
            ds.type AS status,
            da.description,
            da.date
        FROM denounce_action da
        INNER JOIN denounce d ON da.id_denounce = d.id
        INNER JOIN denounce_status ds ON da.id_denounce_status = ds.id
        WHERE d.id = p_id
        ORDER BY da.date DESC;
    ELSE
        SELECT 
            d.id AS idDenounce,
            ds.type AS status,
            da.description,
            da.date
        FROM denounce_action da
        INNER JOIN denounce d ON da.id_denounce = d.id
        INNER JOIN denounce_status ds ON da.id_denounce_status = ds.id
        WHERE d.id = p_id
        ORDER BY da.date DESC;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findDetailDenounce` (IN `p_id_denounce` INT)   BEGIN
    DECLARE v_proofs TEXT;

    -- Obtener las rutas de las pruebas concatenadas
    SELECT GROUP_CONCAT(P.path SEPARATOR ',') INTO v_proofs
    FROM proof AS P
    WHERE P.id_denounce = p_id_denounce;

    -- Seleccionar el detalle completo de la denuncia
    SELECT 
        D.code COLLATE utf8mb4_general_ci AS code,
        D.reception_media COLLATE utf8mb4_general_ci AS receptionMedia,
        D.date,
        D.has_previous_denounce AS hasPreviousDenounce,
        D.has_response AS hasResponse,
        D.directed_entity COLLATE utf8mb4_general_ci AS directedEntity,
        D.entity_response COLLATE utf8mb4_general_ci AS entityResponse,
        D.comunication_media COLLATE utf8mb4_general_ci AS comunicationMedia,
        D.source COLLATE utf8mb4_general_ci AS source,
        D.keep_identity AS keepIdentity,
        D.address COLLATE utf8mb4_general_ci AS address,
        D.reference COLLATE utf8mb4_general_ci AS reference,
        D.facts_description COLLATE utf8mb4_general_ci AS factsDescription,
        D.ambiental_promise COLLATE utf8mb4_general_ci AS ambientalPromise,
        D.proof_description COLLATE utf8mb4_general_ci AS proofDescription,
        COALESCE(v_proofs, 'NO PRESENTO PRUEBAS') COLLATE utf8mb4_general_ci AS proofs,
        GROUP_CONCAT(DISTINCT AC.type SEPARATOR ',') COLLATE utf8mb4_general_ci AS ambientalCauses
    FROM denounce AS D
    LEFT JOIN denounce_ambiental_cause AS DAC ON D.id = DAC.id_denounce
    LEFT JOIN ambiental_cause AS AC ON DAC.id_ambiental_cause = AC.id
    WHERE D.id = p_id_denounce
    GROUP BY D.id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findProofById` (IN `p_id_denounce` INT)   BEGIN
    SELECT 
        PR.path COLLATE utf8mb4_general_ci AS path
    FROM proof AS PR
    WHERE PR.id_denounce = p_id_denounce;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_findPublicInformationByDenounceId` (IN `p_id_denounce` INT)   BEGIN
    SELECT
        DATE_FORMAT(D.date, '%d-%m-%Y') AS date,
        CASE
            WHEN P2.is_natural_person = 1 
                THEN CONCAT(P2.name, ' ', P2.paternal_surname, ' ', P2.mother_surname)
            WHEN P2.is_natural_person = 0 
                THEN P2.trade_name
            ELSE 'Not found denounced'
        END COLLATE utf8mb4_general_ci AS denouncedName,
        P2.doc_number COLLATE utf8mb4_general_ci AS denouncedDocNumber,
        D.ambiental_promise COLLATE utf8mb4_general_ci AS ambientalPromise,
        P2.is_natural_person AS isNatural
    FROM denounce AS D
    INNER JOIN person_denounce AS PD2 
        ON D.id = PD2.id_denounce AND PD2.is_affected = 0
    INNER JOIN person AS P2 
        ON PD2.id_person = P2.id
    WHERE D.id = p_id_denounce;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `usp_updateStateDenounce` (IN `p_id` INT, IN `p_newState` INT, IN `p_description` TEXT)   BEGIN
    INSERT INTO denounce_action(id_denounce, id_denounce_status, description)
    VALUES (p_id, p_newState, p_description COLLATE utf8mb4_general_ci);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ambiental_cause`
--

CREATE TABLE `ambiental_cause` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ambiental_cause`
--

INSERT INTO `ambiental_cause` (`id`, `type`) VALUES
(1, 'Emisiones de Gases y Humos'),
(2, 'Vertimiento de Liquidos'),
(3, 'Vertimiento de Solidos'),
(4, 'Material Particulado'),
(5, 'Ruidos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `denounce`
--

CREATE TABLE `denounce` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(36) NOT NULL,
  `reception_media` varchar(30) NOT NULL,
  `date` date NOT NULL,
  `has_previous_denounce` tinyint(1) NOT NULL DEFAULT 0,
  `has_response` tinyint(1) NOT NULL DEFAULT 0,
  `directed_entity` varchar(50) NOT NULL,
  `entity_response` varchar(50) NOT NULL,
  `comunication_media` varchar(50) NOT NULL,
  `source` varchar(50) NOT NULL,
  `keep_identity` tinyint(1) NOT NULL DEFAULT 0,
  `address` varchar(250) NOT NULL,
  `reference` varchar(250) NOT NULL,
  `facts_description` text NOT NULL,
  `ambiental_promise` varchar(15) NOT NULL,
  `proof_description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `denounce`
--

INSERT INTO `denounce` (`id`, `code`, `reception_media`, `date`, `has_previous_denounce`, `has_response`, `directed_entity`, `entity_response`, `comunication_media`, `source`, `keep_identity`, `address`, `reference`, `facts_description`, `ambiental_promise`, `proof_description`) VALUES
(2, 'fc897e5f-b9dd-4cca-ba96-862ca0da1dc9', 'Formularios electrónicos', '2025-10-03', 0, 0, 'NO ESPECIFICA', 'NO ESPECIFICA', 'internet', 'sitio web', 0, 'EN MI CASA', 'CALLE MARTE', 'ASENTAMIENTO HUMANO', 'agua', 'PRUEBA'),
(3, '10e40e9c-0f49-4420-bfaf-848b490661c4', 'Formularios electrónicos', '2025-10-03', 0, 0, 'NO ESPECIFICA', 'NO ESPECIFICA', 'internet', 'sitio web', 0, 'EN MI CASA', 'CALLE PLUTON', 'CONTAMINACION AIRE', 'viento', 'PRUEBA EVIDENCIA'),
(4, 'c97ebb66-62bd-4628-8907-1dce9df14269', 'Formularios electrónicos', '2025-10-03', 0, 0, 'NO ESPECIFICA', 'NO ESPECIFICA', 'internet', 'sitio web', 0, 'EN MI CASA 3', 'CALLE SATURNO', 'MUCHO RUIDO', 'ruido', ''),
(5, 'db59b3de-f3c6-48e7-99fe-2358829c24a1', 'Formularios electrónicos', '2025-10-04', 1, 1, 'A TOTUS', 'CLARO QUE SI', 'redes sociales', 'sitio web', 0, 'EN CHICLAYO EN LA FERIA BALTA', 'FERIA BALTA AL FRENTE DEL BCP', 'ESTA ES UNA PRUEBA - RECORDAR', 'viento', 'EVIDENCIA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `denounce_action`
--

CREATE TABLE `denounce_action` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_denounce` int(10) UNSIGNED NOT NULL,
  `id_denounce_status` smallint(5) UNSIGNED NOT NULL,
  `description` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `denounce_action`
--

INSERT INTO `denounce_action` (`id`, `id_denounce`, `id_denounce_status`, `description`, `date`) VALUES
(2, 2, 1, 'Se registró la denuncia', '2025-10-03 23:31:53'),
(3, 3, 1, 'Se registró la denuncia', '2025-10-03 23:36:15'),
(4, 4, 1, 'Se registró la denuncia', '2025-10-03 23:37:21'),
(5, 5, 1, 'Se registró la denuncia', '2025-10-05 03:19:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `denounce_ambiental_cause`
--

CREATE TABLE `denounce_ambiental_cause` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ambiental_cause` smallint(5) UNSIGNED NOT NULL,
  `id_denounce` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `denounce_ambiental_cause`
--

INSERT INTO `denounce_ambiental_cause` (`id`, `id_ambiental_cause`, `id_denounce`) VALUES
(3, 2, 2),
(4, 1, 3),
(5, 4, 4),
(6, 5, 4),
(7, 1, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `denounce_status`
--

CREATE TABLE `denounce_status` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `type` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `denounce_status`
--

INSERT INTO `denounce_status` (`id`, `type`) VALUES
(1, 'REGISTRADO'),
(2, 'RECIBIDO'),
(3, 'ATENDIDO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `document_type`
--

CREATE TABLE `document_type` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `type` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `document_type`
--

INSERT INTO `document_type` (`id`, `type`) VALUES
(1, 'DNI'),
(2, 'RUC');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `version`, `class`, `group`, `namespace`, `time`, `batch`) VALUES
(1, '2025-09-27-205827', 'App\\Database\\Migrations\\CreateAmbientalTables', 'default', 'App', 1759010827, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `person`
--

CREATE TABLE `person` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_doc_type` smallint(5) UNSIGNED NOT NULL,
  `is_natural_person` tinyint(1) NOT NULL,
  `doc_number` varchar(11) NOT NULL DEFAULT 'NO TIENE',
  `trade_name` varchar(150) NOT NULL,
  `name` varchar(45) NOT NULL,
  `paternal_surname` varchar(45) NOT NULL,
  `mother_surname` varchar(45) NOT NULL,
  `legal_representator` varchar(250) NOT NULL DEFAULT 'NO ESPECIFICA',
  `address` varchar(250) NOT NULL,
  `fixed_phone` varchar(10) NOT NULL DEFAULT 'NO TIENE',
  `first_phone` char(9) NOT NULL DEFAULT 'NO TIENE',
  `second_phone` char(9) NOT NULL DEFAULT 'NO TIENE',
  `email` varchar(150) NOT NULL DEFAULT 'NO TIENE',
  `departament` varchar(20) NOT NULL,
  `province` varchar(20) NOT NULL,
  `distric` varchar(45) NOT NULL DEFAULT 'JOSÉ LEONARDO ORTIZ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `person`
--

INSERT INTO `person` (`id`, `id_doc_type`, `is_natural_person`, `doc_number`, `trade_name`, `name`, `paternal_surname`, `mother_surname`, `legal_representator`, `address`, `fixed_phone`, `first_phone`, `second_phone`, `email`, `departament`, `province`, `distric`) VALUES
(3, 2, 0, '20542024748', 'EMPRESA NUMERO UNO', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', 'CHICLAYO 1', 'NO TIENE', '987654321', 'NO TIENE', 'nellfuep@gmail.com', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(4, 2, 0, '20603085087', 'EMPRESA NUMERO DOS', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', 'CHICLAYO 1 ', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(5, 2, 0, '20602361307', 'EMPRESA ORO', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', 'CHICLAYO 2', 'NO TIENE', '912345678', 'NO TIENE', 'nellfuep@gmail.com', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(6, 2, 0, '20603209975', 'EMPRESA PLATA', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', 'CHICLAYO', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(7, 2, 0, '20293910767', 'EMPRESA FANTASMA', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', 'NO SE SABE PERO ES EN LAMBAYEQUE', 'NO TIENE', '987654321', 'NO TIENE', 'nellfuep@gmail.com', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(8, 2, 0, 'SIN DATOS', '', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO ESPECIFICA', '', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(9, 2, 0, '20552103816', 'AGROLIGHT PERU S.A.C.', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'AGROLIGHT', 'CHICLAYO - JOSE LEONARDO ORTIZ', '123456', '987654321', '932165478', 'nellfuep@gmail.com', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ'),
(10, 2, 0, '20538856674', 'ARTROSCOPICTRAUMA S.A.C.', 'NO TIENE', 'NO TIENE', 'NO TIENE', 'ARTROSCOPICTRAUMA', 'CHICLAYO - MODELO BALTA', '654321', '963258741', '952863147', 'davidmesta09@gmail.com', 'LAMBAYEQUE', 'CHICLAYO', 'JOSE LEONARDO ORTIZ');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `person_denounce`
--

CREATE TABLE `person_denounce` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_person` int(10) UNSIGNED NOT NULL,
  `id_denounce` int(10) UNSIGNED NOT NULL,
  `is_affected` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `person_denounce`
--

INSERT INTO `person_denounce` (`id`, `id_person`, `id_denounce`, `is_affected`) VALUES
(3, 3, 2, 1),
(4, 4, 2, 0),
(5, 5, 3, 1),
(6, 6, 3, 0),
(7, 7, 4, 1),
(8, 8, 4, 0),
(9, 9, 5, 1),
(10, 10, 5, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proof`
--

CREATE TABLE `proof` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_denounce` int(10) UNSIGNED NOT NULL,
  `path` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proof`
--

INSERT INTO `proof` (`id`, `id_denounce`, `path`) VALUES
(2, 2, '/uploads/f9e34a3f-62ae-4640-b5da-3c6d993b82a6.jpeg'),
(3, 3, '/uploads/2e8337cf-f768-4947-bcd4-bcad56b14219.jpeg'),
(4, 4, '/uploads/18f2cb2f-8de6-409b-a49c-02f0681b66db.png'),
(5, 5, '/uploads/b4585f1f-821d-4dd4-9dc8-d98afea983d0.jpeg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `paternal_surname` varchar(50) NOT NULL,
  `mother_surname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `paternal_surname`, `mother_surname`, `email`, `password`) VALUES
(1, 'Informatica', 'MDJLO', 'MDJLO', 'informatica@gmail.com', '$2y$10$rm3ya4RJ6s676TqJdcMbxuBOP0UDTJvGdfWGt/BJuWopqdVGsprIy');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ambiental_cause`
--
ALTER TABLE `ambiental_cause`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `denounce`
--
ALTER TABLE `denounce`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `denounce_action`
--
ALTER TABLE `denounce_action`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_denounce` (`id_denounce`),
  ADD KEY `id_denounce_status` (`id_denounce_status`);

--
-- Indices de la tabla `denounce_ambiental_cause`
--
ALTER TABLE `denounce_ambiental_cause`
  ADD PRIMARY KEY (`id`),
  ADD KEY `denounce_ambiental_cause_id_ambiental_cause_foreign` (`id_ambiental_cause`),
  ADD KEY `denounce_ambiental_cause_id_denounce_foreign` (`id_denounce`);

--
-- Indices de la tabla `denounce_status`
--
ALTER TABLE `denounce_status`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `document_type`
--
ALTER TABLE `document_type`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `person`
--
ALTER TABLE `person`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_doc_type` (`id_doc_type`);

--
-- Indices de la tabla `person_denounce`
--
ALTER TABLE `person_denounce`
  ADD PRIMARY KEY (`id`),
  ADD KEY `person_denounce_id_person_foreign` (`id_person`),
  ADD KEY `person_denounce_id_denounce_foreign` (`id_denounce`);

--
-- Indices de la tabla `proof`
--
ALTER TABLE `proof`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proof_id_denounce_foreign` (`id_denounce`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ambiental_cause`
--
ALTER TABLE `ambiental_cause`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `denounce`
--
ALTER TABLE `denounce`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `denounce_action`
--
ALTER TABLE `denounce_action`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `denounce_ambiental_cause`
--
ALTER TABLE `denounce_ambiental_cause`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `denounce_status`
--
ALTER TABLE `denounce_status`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `document_type`
--
ALTER TABLE `document_type`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `person`
--
ALTER TABLE `person`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `person_denounce`
--
ALTER TABLE `person_denounce`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `proof`
--
ALTER TABLE `proof`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `denounce_action`
--
ALTER TABLE `denounce_action`
  ADD CONSTRAINT `denounce_action_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `denounce_action_id_denounce_status_foreign` FOREIGN KEY (`id_denounce_status`) REFERENCES `denounce_status` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `denounce_ambiental_cause`
--
ALTER TABLE `denounce_ambiental_cause`
  ADD CONSTRAINT `denounce_ambiental_cause_id_ambiental_cause_foreign` FOREIGN KEY (`id_ambiental_cause`) REFERENCES `ambiental_cause` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `denounce_ambiental_cause_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `person`
--
ALTER TABLE `person`
  ADD CONSTRAINT `person_id_doc_type_foreign` FOREIGN KEY (`id_doc_type`) REFERENCES `document_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `person_denounce`
--
ALTER TABLE `person_denounce`
  ADD CONSTRAINT `person_denounce_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `person_denounce_id_person_foreign` FOREIGN KEY (`id_person`) REFERENCES `person` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `proof`
--
ALTER TABLE `proof`
  ADD CONSTRAINT `proof_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
