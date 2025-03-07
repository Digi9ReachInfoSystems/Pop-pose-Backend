

exports.getTimer = async (req, res) => {
    const { value } = req.params;
    try {
        if (value == 1) {
            res.status(200).json({ message: "Success ", value: 10 });
        }
        else if (value == 2) {
            res.status(200).json({ message: "Success ", value: 5 });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

exports.updateTimer = async (req, res) => {
    const { value } = req.params;
    const { newValue } = req.body;
    const {updateSecondValue} = req.body
    try {
        if (value == 1) {
            res.status(200).json({ message: "Success ", value: newValue });
        }
        else if (value == 2) {
            res.status(200).json({ message: "Success ", value: updateSecondValue });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

exports.deleteTimer = async (req, res) => {
    const { value } = req.params;  
    try {
        if (value == 1 || value == 2) {
            res.status(200).json({ message: `Timer with value ${value} deleted successfully` });
        } else {
            res.status(400).json({ message: "Invalid value for deletion" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

