import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import SupportMessage from "../models/SupportMessage.js";

dotenv.config();

const donors = [
  {
    role: "donor",
    name: "Aarav Sharma",
    email: "aarav.donor@example.com",
    password: "Password@123",
    phone: "9876543210",
    bloodGroup: "O+",
    city: "Delhi",
    address: "Karol Bagh, Delhi",
    age: 24,
    gender: "Male",
    isAvailable: true,
    emergencyContact: "9876500001",
    avatarColor: "#ef4444",
  },
  {
    role: "donor",
    name: "Priya Verma",
    email: "priya.donor@example.com",
    password: "Password@123",
    phone: "9876543211",
    bloodGroup: "A+",
    city: "Lucknow",
    address: "Hazratganj, Lucknow",
    age: 27,
    gender: "Female",
    isAvailable: true,
    emergencyContact: "9876500002",
    avatarColor: "#ec4899",
  },
  {
    role: "donor",
    name: "Rohan Singh",
    email: "rohan.donor@example.com",
    password: "Password@123",
    phone: "9876543212",
    bloodGroup: "B-",
    city: "Patna",
    address: "Boring Road, Patna",
    age: 29,
    gender: "Male",
    isAvailable: true,
    emergencyContact: "9876500003",
    avatarColor: "#8b5cf6",
  },
];

const patients = [
  {
    role: "patient",
    name: "Sneha Gupta",
    email: "sneha.patient@example.com",
    password: "Password@123",
    phone: "9876543290",
    bloodGroup: "AB+",
    city: "Delhi",
    hospitalName: "City Care Hospital",
    emergencyContact: "9876500099",
    avatarColor: "#06b6d4",
  },
];

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    await SupportMessage.deleteMany({});

    const createdDonors = await User.create(donors);
    const createdPatients = await User.create(patients);

    await BloodRequest.create({
      patient: createdPatients[0]._id,
      patientName: createdPatients[0].name,
      bloodGroup: "O+",
      units: 2,
      city: "Delhi",
      hospitalName: "City Care Hospital",
      urgency: "Urgent",
      contactNumber: createdPatients[0].phone,
      message: "Need O+ blood for surgery support.",
    });

    console.log("Database seeded successfully.");
    console.log(
      `Created ${createdDonors.length} donors and ${createdPatients.length} patient.`,
    );
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runSeed();
