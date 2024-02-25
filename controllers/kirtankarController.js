const Kirtankar = require("../models/kirtankarModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Appointment = require("../models/appointmentModel");

const getallkirtankar = async (req, res) => {
  try {
    let docs;
    if (!req.locals) {
      docs = await Kirtankar.find({ isKirtankar: true }).populate("userId");
    } else {
      docs = await Kirtankar.find({ isKirtankar: true })
        .find({
          _id: { $ne: req.locals },
        })
        .populate("userId");
    }

    return res.send(docs);
  } catch (error) {
    res.status(500).send("Unable to get Kirtankars");
  }
};

const getnotkirtankar = async (req, res) => {
  try {
    const docs = await Kirtankar.find({ isKirtankar: false })
      .find({
        _id: { $ne: req.locals },
      })
      .populate("userId");

    return res.send(docs);
  } catch (error) {
    res.status(500).send("Unable to get non Kirtankars");
  }
};

const applyforkirtankar = async (req, res) => {
  try {
    const alreadyFound = await Kirtankar.findOne({ userId: req.locals });
    if (alreadyFound) {
      return res.status(400).send("Application already exists");
    }

    const kirtankar = Kirtankar({ ...req.body.formDetails, userId: req.locals });
    const result = await kirtankar.save();

    return res.status(201).send("Application submitted successfully");
  } catch (error) {
    res.status(500).send("Unable to submit application");
  }
};

const acceptkirtankar = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.body.id },
      { isKirtankar: true, status: "accepted" }
    );

    const kirtankar = await Kirtankar.findOneAndUpdate(
      { userId: req.body.id },
      { isKirtankar: true }
    );

    const notification = await Notification({
      userId: req.body.id,
      content: `Congratulations, Your application has been accepted.`,
    });

    await notification.save();

    return res.status(201).send("Application accepted notification sent");
  } catch (error) {
    res.status(500).send("Error while sending notification");
  }
};

const rejectkirtankar = async (req, res) => {
  try {
    const details = await User.findOneAndUpdate(
      { _id: req.body.id },
      { isKirtankar: false, status: "rejected" }
    );
    const delDoc = await Kirtankar.findOneAndDelete({ userId: req.body.id });

    const notification = await Notification({
      userId: req.body.id,
      content: `Sorry, Your application has been rejected.`,
    });

    await notification.save();

    return res.status(201).send("Application rejection notification sent");
  } catch (error) {
    res.status(500).send("Error while rejecting application");
  }
};

const deletekirtankar = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req.body.userId, {
      isKirtankar: false,
    });
    const removeDoc = await Kirtankar.findOneAndDelete({
      userId: req.body.userId,
    });
    const removeAppoint = await Appointment.findOneAndDelete({
      userId: req.body.userId,
    });
    return res.send("Kirtankar deleted successfully");
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to delete Kirtankar");
  }
};


module.exports = {
  getallkirtankar,
  getnotkirtankar,
  deletekirtankar,
  applyforkirtankar,
  acceptkirtankar,
  rejectkirtankar,
};