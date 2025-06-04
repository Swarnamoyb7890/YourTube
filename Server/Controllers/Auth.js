import users from "../Models/Auth.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      try {
        const newUser = await users.create({ email });

        const token = jwt.sign(
          { email: newUser.email, id: newUser._id },
          process.env.JWT_SECRET, // ✅ fixed spelling
          { expiresIn: "1h" }
        );

        return res.status(200).json({ result: newUser, token });
      } catch (error) {
        console.error("User creation error:", error);
        return res.status(500).json({ mess: "Something went wrong", error: error.message });
      }
    } else {
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ result: existingUser, token });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ mess: "Something went wrong", error: error.message });
  }
};
