CREATE TABLE `biological_age_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recordDate` date NOT NULL,
	`biologicalAge` decimal(6,2) NOT NULL,
	`chronologicalAge` decimal(6,2),
	`healthScore` int,
	`estimatedLifeExpectancy` decimal(6,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biological_age_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biomarkers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`healthReportId` int NOT NULL,
	`userId` int NOT NULL,
	`glucose` decimal(6,2),
	`totalCholesterol` decimal(6,2),
	`ldlCholesterol` decimal(6,2),
	`hdlCholesterol` decimal(6,2),
	`triglycerides` decimal(6,2),
	`systolicBP` decimal(6,2),
	`diastolicBP` decimal(6,2),
	`creatinine` decimal(6,2),
	`albumin` decimal(6,2),
	`lymphocytePercent` decimal(6,2),
	`cReactiveProtein` decimal(6,2),
	`redCellDistributionWidth` decimal(6,2),
	`meanPlateletVolume` decimal(6,2),
	`whiteBloodCellCount` decimal(6,2),
	`biologicalAge` decimal(6,2),
	`biologicalAgeAccuracy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `biomarkers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkInDate` date NOT NULL,
	`exerciseMinutes` int,
	`exerciseIntensity` enum('light','moderate','vigorous'),
	`sleepHours` decimal(4,1),
	`sleepQuality` int,
	`dietQuality` int,
	`dietDescription` text,
	`stressLevel` int,
	`smokingCigarettes` int,
	`alcoholDrinks` decimal(4,1),
	`weight` decimal(6,2),
	`mood` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recommendationDate` date NOT NULL,
	`category` enum('exercise','diet','sleep','stress','smoking','alcohol','weight') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`expectedBenefit` decimal(6,2),
	`priority` enum('high','medium','low') DEFAULT 'medium',
	`status` enum('pending','accepted','completed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportDate` date NOT NULL,
	`reportType` enum('manual','uploaded') NOT NULL DEFAULT 'manual',
	`sourceUrl` text,
	`extractedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lifespan_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`predictionDate` date NOT NULL,
	`baseLifeExpectancy` decimal(6,2),
	`lifestyleAdjustment` decimal(6,2),
	`biomarkerAdjustment` decimal(6,2),
	`estimatedLifeExpectancy` decimal(6,2) NOT NULL,
	`remainingYears` decimal(6,2),
	`healthScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lifespan_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` date;--> statement-breakpoint
ALTER TABLE `users` ADD `gender` enum('male','female','other');