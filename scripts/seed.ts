import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import User, { UserRole } from "../models/User";
import Project, { ProjectStatus } from "../models/Project";
import CheckIn, { CheckInType } from "../models/CheckIn";
import Risk, { RiskSeverity, RiskStatus } from "../models/Risk";

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined. Make sure .env.local exists and is configured."
      );
    }

    await mongoose.connect(MONGODB_URI);
    console.info("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await CheckIn.deleteMany({});
    await Risk.deleteMany({});
    console.info("Cleared existing data");

    const admin = await User.create({
      name: "Admin User",
      email: "admin@projectpulse.com",
      password: "admin123",
      role: UserRole.ADMIN,
    });

    const client = await User.create({
      name: "John Client",
      email: "client@example.com",
      password: "client123",
      role: UserRole.CLIENT,
    });

    const employee1 = await User.create({
      name: "Sarah Developer",
      email: "sarah@projectpulse.com",
      password: "employee123",
      role: UserRole.EMPLOYEE,
    });

    const employee2 = await User.create({
      name: "Mike Designer",
      email: "mike@projectpulse.com",
      password: "employee123",
      role: UserRole.EMPLOYEE,
    });

    console.info("Created users");

    // Create demo project
    const project = await Project.create({
      name: "E-Commerce Platform Redesign",
      description:
        "Complete redesign of the client e-commerce platform with enhanced user experience and modern technology stack.",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-06-30"),
      status: ProjectStatus.ON_TRACK,
      healthScore: 85,
      client: client._id,
      employees: [employee1._id, employee2._id],
    });

    console.info("Created demo project");

    // Create sample check-ins
    await CheckIn.create({
      project: project._id,
      user: employee1._id,
      type: CheckInType.EMPLOYEE_UPDATE,
      progress: 65,
      confidence: 4,
      blockers: "Waiting for API documentation from third-party vendor",
    });

    await CheckIn.create({
      project: project._id,
      user: client._id,
      type: CheckInType.CLIENT_FEEDBACK,
      satisfaction: 5,
      communication: 5,
      comments:
        "Very happy with the progress. Team is responsive and professional.",
    });

    console.info("Created sample check-ins");

    // Create sample risk
    await Risk.create({
      project: project._id,
      user: employee1._id,
      title: "Third-party API integration delay",
      severity: RiskSeverity.MEDIUM,
      mitigation:
        "Working with vendor to expedite documentation. Prepared fallback solution if needed.",
      status: RiskStatus.OPEN,
    });

    console.info("Created sample risk");

    console.info("\n=== SEED COMPLETE ===");
    console.info("\nDemo Login Credentials:");
    console.info("\nAdmin:");
    console.info("  Email: admin@projectpulse.com");
    console.info("  Password: admin123");
    console.info("\nClient:");
    console.info("  Email: client@example.com");
    console.info("  Password: client123");
    console.info("\nEmployees:");
    console.info("  Email: sarah@projectpulse.com");
    console.info("  Password: employee123");
    console.info("  Email: mike@projectpulse.com");
    console.info("  Password: employee123\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
