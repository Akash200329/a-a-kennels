-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: stud_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `breeding_dates`
--

DROP TABLE IF EXISTS `breeding_dates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `breeding_dates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stud_id` int NOT NULL,
  `breeding_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stud_id` (`stud_id`),
  CONSTRAINT `breeding_dates_ibfk_1` FOREIGN KEY (`stud_id`) REFERENCES `studs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `breeding_dates`
--

LOCK TABLES `breeding_dates` WRITE;
/*!40000 ALTER TABLE `breeding_dates` DISABLE KEYS */;
INSERT INTO `breeding_dates` VALUES (74,15,'2025-03-31'),(75,16,'2025-03-03'),(76,16,'2025-03-29'),(77,16,'2025-03-31'),(78,17,'2025-03-22'),(79,17,'2025-03-29'),(80,18,'2025-03-23'),(81,18,'2025-03-24'),(82,18,'2025-03-29'),(84,14,'2025-03-15'),(85,14,'2025-03-22'),(88,21,'2025-03-29'),(89,21,'2025-04-04');
/*!40000 ALTER TABLE `breeding_dates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `breeding_timeline`
--

DROP TABLE IF EXISTS `breeding_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `breeding_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stud` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `next_heat` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `breeding_timeline`
--

LOCK TABLES `breeding_timeline` WRITE;
/*!40000 ALTER TABLE `breeding_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `breeding_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `male_studs`
--

DROP TABLE IF EXISTS `male_studs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `male_studs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `lineage` varchar(255) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `temperament` varchar(100) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `male_studs`
--

LOCK TABLES `male_studs` WRITE;
/*!40000 ALTER TABLE `male_studs` DISABLE KEYS */;
INSERT INTO `male_studs` VALUES (1,'Bheesma','Import ','Black and white wooly coat','Good',3,'Mysore','1741490242108.png'),(2,'Bheesma','Import ','Black and white wooly coat','Good',3,'Mysore','1741490319721.png'),(3,'Bheesma','Import ','Black and white wooly coat','Good',8,'Mysore','1741492593738.jpg'),(5,'a','a','a','a',2,'a','https://res.cloudinary.com/dhzqwzrms/image/upload/v1741546571/aanda-kennels/male-studs/ydq7cycz7npfgbgvvz1h.jpg');
/*!40000 ALTER TABLE `male_studs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,'akashnayak200329@gmail.com','3584f68602f9137c8f736870674bab97d3dad3e5','2025-03-09 13:04:44',0,'2025-03-09 12:04:43'),(2,'akashnayak200329@gmail.com','4178ee1b0e74468ed27a1e19694e60d36e4ca632','2025-03-09 13:04:44',0,'2025-03-09 12:04:43'),(3,'akashnayak200329@gmail.com','f466734b96f75d5cf02be8007e8efa721ebf7e42','2025-03-09 13:04:44',0,'2025-03-09 12:04:44'),(4,'akashnayak200329@gmail.com','15ab33c86c3f0955703d4179ee0b598f4201f3c8','2025-03-09 13:04:44',0,'2025-03-09 12:04:44'),(5,'akashnayak200329@gmail.com','4c6320390dc2e34e1f584cb2f0d78299404d7fd1','2025-03-09 13:04:45',0,'2025-03-09 12:04:44'),(6,'akashnayak200329@gmail.com','154002ba706db7308d95e7515f0cb181b0ac1436','2025-03-09 13:34:20',0,'2025-03-09 12:34:20'),(7,'akashnayak200329@gmail.com','1462a4bf5be10d562bcfe7d15911ca97328a7613','2025-03-09 14:09:43',0,'2025-03-09 13:09:42'),(8,'akashnayak200329@gmail.com','5df7d72c5496b5007696c4e035f00286e63c6e12','2025-03-09 14:09:46',0,'2025-03-09 13:09:45'),(9,'akashnayak200329@gmail.com','8562868536997599604e6d2e4cc7d6938c58830c','2025-03-09 14:51:49',1,'2025-03-09 13:51:48'),(10,'akashnayak200329@gmail.com','a70ab4a21c346726d87b92218c48f251fec5b4ff','2025-03-09 14:53:16',1,'2025-03-09 13:53:15'),(11,'akashnayak200329@gmail.com','e0d536b71430773835fdf0228dc268bc16c0c95f','2025-03-09 15:11:24',0,'2025-03-09 14:11:24'),(12,'akashnayak200329@gmail.com','e245eeb188ba47c86be8dd66d47b3b846170089a','2025-03-09 15:11:27',0,'2025-03-09 14:11:26'),(13,'akashnayak200329@gmail.com','3c3af818104a8773d1728186706d18d0b7c500f3','2025-03-09 15:11:27',0,'2025-03-09 14:11:27'),(14,'akashnayak200329@gmail.com','90d6da76f989207e36dee6254839287a4baa9ded','2025-03-09 15:15:50',1,'2025-03-09 14:15:50'),(15,'akashnayak200329@gmail.com','03b323d79829677f44940f05c3f911dbeff732d9','2025-03-09 21:01:40',1,'2025-03-09 20:01:39');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studs`
--

DROP TABLE IF EXISTS `studs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `owner_contact` varchar(15) NOT NULL,
  `female_dog_color` varchar(50) NOT NULL,
  `female_breed` varchar(100) NOT NULL,
  `female_first_day_of_heat` date NOT NULL,
  `female_status` enum('Waiting','Delivered','Failure') NOT NULL DEFAULT 'Waiting',
  `female_puppy_count` int DEFAULT NULL,
  `female_dog_image` varchar(255) DEFAULT NULL,
  `breeding_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studs`
--

LOCK TABLES `studs` WRITE;
/*!40000 ALTER TABLE `studs` DISABLE KEYS */;
INSERT INTO `studs` VALUES (14,'fohvb','uig','BIY','IG','UIG','2025-03-08','Waiting',NULL,'1741446257367.jpg','1741446257362.jpg'),(15,'UIFV','GJVB','KJB','JVB','JJKBV','2025-03-16','Waiting',NULL,'1741446335609.png','1741446335590.jpg'),(16,'A','A','A','A','A','2025-03-24','Waiting',NULL,'1741446403572.jpg','1741446403550.jpg'),(17,'goih','bfj','fbho','fbs','fb','2025-03-13','Waiting',NULL,'1741448037649.jpg','1741448037631.jpg'),(18,'fiov','c','c','c','c','2025-03-23','Waiting',NULL,'1741448705274.png','1741448705273.png'),(21,'sjdkvb','s','s','s','sa','2025-03-27','Waiting',NULL,'https://res.cloudinary.com/dhzqwzrms/image/upload/v1741546284/aanda-kennels/studs/ewh1sqb9dilhqde3wrah.jpg','https://res.cloudinary.com/dhzqwzrms/image/upload/v1741546286/aanda-kennels/studs/lkjqlcj7xspimlaslh8h.jpg');
/*!40000 ALTER TABLE `studs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$1mxlyxTscHDYIpyGPHXGiOcuA9w7SxW9z6T8XNvfgPFWHqdZ8KWdK','admin','akashnayak200329@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-10  3:45:59
