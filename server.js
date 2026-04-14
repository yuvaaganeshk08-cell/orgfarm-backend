require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 🔥 THIS LINE MUST RUN
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


// services route — organic supplier listings
const SERVICES_DATA = [
  { name: "Green Earth Agro Center",     state: "Tamil Nadu",     district: "Coimbatore",         type: "Fertilizer", rating: 4.5, reviews: 214, phone: "9876543210", mapUrl: "https://maps.google.com/?q=Coimbatore+organic+agro",            icon: "🌾" },
  { name: "Organic Seed Store",          state: "Tamil Nadu",     district: "Chennai",            type: "Seeds",      rating: 4.2, reviews: 98,  phone: "9123456780", mapUrl: "https://maps.google.com/?q=Chennai+organic+seeds",              icon: "🌱" },
  { name: "Kisan Organic Inputs",        state: "Tamil Nadu",     district: "Chennai",            type: "Fertilizer", rating: 4.0, reviews: 67,  phone: "9234567890", mapUrl: "https://maps.google.com/?q=Chennai+kisan+organic",              icon: "🌿" },
  { name: "Namma Farm Tools",            state: "Tamil Nadu",     district: "Madurai",            type: "Tools",      rating: 4.7, reviews: 145, phone: "8765432190", mapUrl: "https://maps.google.com/?q=Madurai+farm+tools",                 icon: "🔧" },
  { name: "Salem Bio Shield",            state: "Tamil Nadu",     district: "Salem",              type: "Pesticide",  rating: 4.1, reviews: 126, phone: "9345011200", mapUrl: "https://maps.google.com/?q=Salem+bio+pesticide+store",          icon: "🛡️" },
  { name: "Cauvery Organic Mart",        state: "Tamil Nadu",     district: "Tiruchirappalli",    type: "Organic",    rating: 4.6, reviews: 188, phone: "9362211400", mapUrl: "https://maps.google.com/?q=Tiruchirappalli+organic+mart",       icon: "♻️" },
  { name: "Nellai Green Compost",        state: "Tamil Nadu",     district: "Tirunelveli",        type: "Organic",    rating: 4.4, reviews: 109, phone: "9380011300", mapUrl: "https://maps.google.com/?q=Tirunelveli+organic+compost",        icon: "🌿" },
  { name: "Kerala Organic Hub",          state: "Kerala",         district: "Kochi",              type: "Organic",    rating: 4.6, reviews: 321, phone: "9988776655", mapUrl: "https://maps.google.com/?q=Kochi+organic+hub",                  icon: "🌿" },
  { name: "Malabar Seed & Soil",         state: "Kerala",         district: "Kozhikode",          type: "Seeds",      rating: 4.5, reviews: 173, phone: "9447012200", mapUrl: "https://maps.google.com/?q=Kozhikode+organic+seeds",            icon: "🌱" },
  { name: "Travancore Bio Inputs",       state: "Kerala",         district: "Thiruvananthapuram", type: "Fertilizer", rating: 4.3, reviews: 141, phone: "9447023300", mapUrl: "https://maps.google.com/?q=Thiruvananthapuram+bio+fertilizer",  icon: "🌾" },
  { name: "Thrissur Farm Equipments",    state: "Kerala",         district: "Thrissur",           type: "Tools",      rating: 4.2, reviews: 94,  phone: "9447034400", mapUrl: "https://maps.google.com/?q=Thrissur+farm+tools",                icon: "🔧" },
  { name: "Palakkad Neem Protect",       state: "Kerala",         district: "Palakkad",           type: "Pesticide",  rating: 4.0, reviews: 78,  phone: "9447045500", mapUrl: "https://maps.google.com/?q=Palakkad+bio+pesticide",             icon: "🛡️" },
  { name: "Karnataka Organic Mart",      state: "Karnataka",      district: "Bengaluru",          type: "Fertilizer", rating: 4.1, reviews: 89,  phone: "9654321780", mapUrl: "https://maps.google.com/?q=Bengaluru+organic+mart",             icon: "🌾" },
  { name: "Mysuru Native Seeds",         state: "Karnataka",      district: "Mysuru",             type: "Seeds",      rating: 4.4, reviews: 134, phone: "9886012200", mapUrl: "https://maps.google.com/?q=Mysuru+organic+seed+store",          icon: "🌱" },
  { name: "Coastal Agro Tools",          state: "Karnataka",      district: "Mangaluru",          type: "Tools",      rating: 4.3, reviews: 97,  phone: "9886023300", mapUrl: "https://maps.google.com/?q=Mangaluru+farm+tools",               icon: "🔧" },
  { name: "Hubli Bio Care",              state: "Karnataka",      district: "Hubli",              type: "Pesticide",  rating: 4.1, reviews: 92,  phone: "9886034400", mapUrl: "https://maps.google.com/?q=Hubli+bio+pesticide",                icon: "🛡️" },
  { name: "Dharwad Compost Point",       state: "Karnataka",      district: "Dharwad",            type: "Organic",    rating: 4.5, reviews: 116, phone: "9886045500", mapUrl: "https://maps.google.com/?q=Dharwad+organic+compost",            icon: "♻️" },
  { name: "Vijayawada Bio-Pest Control", state: "Andhra Pradesh", district: "Vijayawada",         type: "Pesticide",  rating: 3.9, reviews: 42,  phone: "9700123456", mapUrl: "https://maps.google.com/?q=Vijayawada+bio+pest",                icon: "🛡️" },
  { name: "Vizag Green Nutrients",       state: "Andhra Pradesh", district: "Visakhapatnam",      type: "Fertilizer", rating: 4.3, reviews: 154, phone: "9700134500", mapUrl: "https://maps.google.com/?q=Visakhapatnam+organic+fertilizer",   icon: "🌾" },
  { name: "Guntur Seed House",           state: "Andhra Pradesh", district: "Guntur",             type: "Seeds",      rating: 4.2, reviews: 111, phone: "9700145600", mapUrl: "https://maps.google.com/?q=Guntur+organic+seed+house",          icon: "🌱" },
  { name: "Nellore Agro Implements",     state: "Andhra Pradesh", district: "Nellore",            type: "Tools",      rating: 4.0, reviews: 84,  phone: "9700156700", mapUrl: "https://maps.google.com/?q=Nellore+farm+tools",                 icon: "🔧" },
  { name: "Kurnool Jeevamruth Center",   state: "Andhra Pradesh", district: "Kurnool",            type: "Organic",    rating: 4.4, reviews: 93,  phone: "9700167800", mapUrl: "https://maps.google.com/?q=Kurnool+organic+inputs",             icon: "🌿" },
  { name: "Sahayadri Seeds Co.",         state: "Maharashtra",    district: "Pune",               type: "Seeds",      rating: 4.3, reviews: 178, phone: "9871234560", mapUrl: "https://maps.google.com/?q=Pune+seeds+organic",                 icon: "🌱" },
  { name: "Mumbai Organic Supply",       state: "Maharashtra",    district: "Mumbai",             type: "Organic",    rating: 4.7, reviews: 263, phone: "9820011100", mapUrl: "https://maps.google.com/?q=Mumbai+organic+supply",              icon: "🌿" },
  { name: "Nagpur Soil Health Store",    state: "Maharashtra",    district: "Nagpur",             type: "Fertilizer", rating: 4.2, reviews: 121, phone: "9820022200", mapUrl: "https://maps.google.com/?q=Nagpur+organic+fertilizer",          icon: "🌾" },
  { name: "Nashik Farm Utility",         state: "Maharashtra",    district: "Nashik",             type: "Tools",      rating: 4.1, reviews: 88,  phone: "9820033300", mapUrl: "https://maps.google.com/?q=Nashik+farm+tools",                  icon: "🔧" },
  { name: "Aurangabad Bio Defend",       state: "Maharashtra",    district: "Aurangabad",         type: "Pesticide",  rating: 4.0, reviews: 75,  phone: "9820044400", mapUrl: "https://maps.google.com/?q=Aurangabad+bio+pesticide",           icon: "🛡️" },
];

app.get("/api/services", (req, res) => {
  res.json(SERVICES_DATA);
});

// test route
app.get("/", (req, res) => {
  res.send("OrgFarm API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));