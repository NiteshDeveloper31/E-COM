import { connectMySQL } from "./config/mysql.js";
import User from "./models/mysql/User.js";
import Category from "./models/mysql/Category.js";
import Banner from "./models/mysql/Banner.js";
import { hashPassword } from "./utils/password.js";

export const seedMySQLData = async () => {
  try {
    await connectMySQL();

    // 1. Seed Superadmin
    let adminUser = await User.findOne({ where: { email: "admin@reetsutra.com" } });
    const hashedPassword = await hashPassword("admin123");
    if (!adminUser) {
      adminUser = await User.create({
        name: "Super Admin",
        email: "admin@reetsutra.com",
        password: hashedPassword,
        role: "admin",
        status: "Active"
      });
      console.log("✅ MySQL Default Superadmin seeded (admin@reetsutra.com / admin123)");
    } else {
      adminUser.password = hashedPassword;
      adminUser.role = "admin";
      await adminUser.save();
      console.log("✅ MySQL Superadmin password & role updated (admin@reetsutra.com / admin123)");
    }



    // 3. Seed Default Banner
    const bannerCount = await Banner.count();
    if (bannerCount === 0) {
      await Banner.create({
        title: "The Taste of Bihar, Crafted with Tradition",
        image: "/assets/Final_Banner_Img_web.png",
        link: "/shop",
        status: "Active",
        order: 1
      });
      console.log("✅ MySQL Default Permanent Banner seeded successfully.");
    }

  } catch (err) {
    console.error("❌ MySQL Seeding Error:", err.message);
  }
};

export default seedMySQLData;
