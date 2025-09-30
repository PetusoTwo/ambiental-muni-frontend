-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: denuncias_ambientales
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ambiental_cause`
--

DROP TABLE IF EXISTS `ambiental_cause`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ambiental_cause` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ambiental_cause`
--

LOCK TABLES `ambiental_cause` WRITE;
/*!40000 ALTER TABLE `ambiental_cause` DISABLE KEYS */;
INSERT INTO `ambiental_cause` VALUES (1,'Emisiones de Gases y Humos'),(2,'Vertimiento de Liquidos'),(3,'Vertimiento de Solidos'),(4,'Material Particulado'),(5,'Ruidos');
/*!40000 ALTER TABLE `ambiental_cause` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denounce`
--

DROP TABLE IF EXISTS `denounce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denounce` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `reception_media` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `has_previous_denounce` tinyint(1) NOT NULL DEFAULT '0',
  `has_response` tinyint(1) NOT NULL DEFAULT '0',
  `directed_entity` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `entity_response` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `comunication_media` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `source` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `keep_identity` tinyint(1) NOT NULL DEFAULT '0',
  `address` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `reference` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `facts_description` text COLLATE utf8mb4_general_ci NOT NULL,
  `ambiental_promise` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `proof_description` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denounce`
--

LOCK TABLES `denounce` WRITE;
/*!40000 ALTER TABLE `denounce` DISABLE KEYS */;
/*!40000 ALTER TABLE `denounce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denounce_action`
--

DROP TABLE IF EXISTS `denounce_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denounce_action` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_denounce` int unsigned NOT NULL,
  `id_denounce_status` smallint unsigned NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_denounce` (`id_denounce`),
  KEY `id_denounce_status` (`id_denounce_status`),
  CONSTRAINT `denounce_action_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE,
  CONSTRAINT `denounce_action_id_denounce_status_foreign` FOREIGN KEY (`id_denounce_status`) REFERENCES `denounce_status` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denounce_action`
--

LOCK TABLES `denounce_action` WRITE;
/*!40000 ALTER TABLE `denounce_action` DISABLE KEYS */;
/*!40000 ALTER TABLE `denounce_action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denounce_ambiental_cause`
--

DROP TABLE IF EXISTS `denounce_ambiental_cause`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denounce_ambiental_cause` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_ambiental_cause` smallint unsigned NOT NULL,
  `id_denounce` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `denounce_ambiental_cause_id_ambiental_cause_foreign` (`id_ambiental_cause`),
  KEY `denounce_ambiental_cause_id_denounce_foreign` (`id_denounce`),
  CONSTRAINT `denounce_ambiental_cause_id_ambiental_cause_foreign` FOREIGN KEY (`id_ambiental_cause`) REFERENCES `ambiental_cause` (`id`) ON DELETE CASCADE,
  CONSTRAINT `denounce_ambiental_cause_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denounce_ambiental_cause`
--

LOCK TABLES `denounce_ambiental_cause` WRITE;
/*!40000 ALTER TABLE `denounce_ambiental_cause` DISABLE KEYS */;
/*!40000 ALTER TABLE `denounce_ambiental_cause` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denounce_status`
--

DROP TABLE IF EXISTS `denounce_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denounce_status` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denounce_status`
--

LOCK TABLES `denounce_status` WRITE;
/*!40000 ALTER TABLE `denounce_status` DISABLE KEYS */;
INSERT INTO `denounce_status` VALUES (1,'REGISTRADO'),(2,'RECIBIDO'),(3,'ATENDIDO');
/*!40000 ALTER TABLE `denounce_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_type`
--

DROP TABLE IF EXISTS `document_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_type` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_type`
--

LOCK TABLES `document_type` WRITE;
/*!40000 ALTER TABLE `document_type` DISABLE KEYS */;
INSERT INTO `document_type` VALUES (1,'DNI'),(2,'RUC');
/*!40000 ALTER TABLE `document_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `class` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `namespace` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `time` int NOT NULL,
  `batch` int unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2025-09-27-205827','App\\Database\\Migrations\\CreateAmbientalTables','default','App',1759249058,1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person`
--

DROP TABLE IF EXISTS `person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_doc_type` smallint unsigned NOT NULL,
  `is_natural_person` tinyint(1) NOT NULL,
  `doc_number` varchar(11) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO TIENE',
  `trade_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `paternal_surname` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `mother_surname` varchar(45) COLLATE utf8mb4_general_ci NOT NULL,
  `legal_representator` varchar(250) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO ESPECIFICA',
  `address` varchar(250) COLLATE utf8mb4_general_ci NOT NULL,
  `fixed_phone` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO TIENE',
  `first_phone` char(9) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO TIENE',
  `second_phone` char(9) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO TIENE',
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NO TIENE',
  `departament` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `province` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `distric` varchar(45) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'JOSÉ LEONARDO ORTIZ',
  PRIMARY KEY (`id`),
  KEY `id_doc_type` (`id_doc_type`),
  CONSTRAINT `person_id_doc_type_foreign` FOREIGN KEY (`id_doc_type`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person`
--

LOCK TABLES `person` WRITE;
/*!40000 ALTER TABLE `person` DISABLE KEYS */;
/*!40000 ALTER TABLE `person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person_denounce`
--

DROP TABLE IF EXISTS `person_denounce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `person_denounce` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_person` int unsigned NOT NULL,
  `id_denounce` int unsigned NOT NULL,
  `is_affected` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `person_denounce_id_person_foreign` (`id_person`),
  KEY `person_denounce_id_denounce_foreign` (`id_denounce`),
  CONSTRAINT `person_denounce_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE,
  CONSTRAINT `person_denounce_id_person_foreign` FOREIGN KEY (`id_person`) REFERENCES `person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_denounce`
--

LOCK TABLES `person_denounce` WRITE;
/*!40000 ALTER TABLE `person_denounce` DISABLE KEYS */;
/*!40000 ALTER TABLE `person_denounce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proof`
--

DROP TABLE IF EXISTS `proof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proof` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_denounce` int unsigned NOT NULL,
  `path` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `proof_id_denounce_foreign` (`id_denounce`),
  CONSTRAINT `proof_id_denounce_foreign` FOREIGN KEY (`id_denounce`) REFERENCES `denounce` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proof`
--

LOCK TABLES `proof` WRITE;
/*!40000 ALTER TABLE `proof` DISABLE KEYS */;
/*!40000 ALTER TABLE `proof` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `paternal_surname` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `mother_surname` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Informatica','MDJLO','MDJLO','informatica@gmail.com','$2y$10$loH.jGzpyT2JRW27ZEYKwO/i./FGQ/xBo.MNY1ErxKOH6ongxrnEO');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-30 11:19:22
