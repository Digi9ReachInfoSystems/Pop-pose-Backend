const PageTimer = require('../models/pageTimerModel');

/**
 * Create a new timer for a given page name.
 * Expects JSON body:
 *   { pageName: String, timerSeconds: Number (>=0) }
 */
exports.createTimer = async (req, res) => {
    try {
        const { pageName, timerSeconds } = req.body;
        console.log('Received create request with:', { pageName, timerSeconds });
        
        // More detailed validation logging
        if (typeof pageName !== 'string' || pageName.trim().length === 0) {
            console.log('Validation failed: pageName invalid');
            return res.status(400).json({ error: 'pageName must be a non-empty string' });
        }

        if (typeof timerSeconds !== 'number' || timerSeconds < 0) {
            console.log('Validation failed: timerSeconds invalid');
            return res.status(400).json({ 
                error: 'timerSeconds must be a non-negative number',
                receivedType: typeof timerSeconds,
                receivedValue: timerSeconds
            });
        }

        const exists = await PageTimer.findOne({ pageName: pageName.trim() });
        if (exists) {
            console.log('Conflict: Timer already exists');
            return res.status(409).json({ 
                error: `Timer for page "${pageName}" already exists. Use UPDATE instead.`
            });
        }

        const newTimer = new PageTimer({
            pageName: pageName.trim(),
            timerSeconds
        });
        await newTimer.save();

        console.log('Timer created successfully:', newTimer);
        res.status(201).json({
            message: `Created timer for page "${pageName}": ${timerSeconds}s`,
            timer: newTimer
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: err.message });
    }
};


exports.getAllTimers = async (req, res) => {
    try {
        const timers = await PageTimer.find();
        res.status(200).json(timers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTimer = async (req, res) => {
    try {
      const { id } = req.params;
      const { pageName, timerSeconds } = req.body;
      
      console.log('Updating timer with id:', id, 'and data:', req.body);
  
      // Validate inputs
      if (typeof pageName !== 'string' || pageName.trim().length === 0) {
        return res.status(400).json({ error: 'pageName must be a non-empty string' });
      }
  
    //   if (typeof timerSeconds !== 'number' || timerSeconds < 0) {
    //     return res.status(400).json({ error: 'timerSeconds must be a non-negative number' });
    //   }
  
      const updatedTimer = await PageTimer.findByIdAndUpdate(
        id,
        { 
          pageName: pageName.trim(),
          timerSeconds 
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedTimer) {
        return res.status(404).json({ error: 'Timer not found' });
      }
  
      res.status(200).json({
        message: 'Timer updated successfully',
        timer: updatedTimer
      });
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ error: err.message });
    }
  };


exports.getTimerByPageName = async (req, res) => {
    try {
        const { pageName } = req.query;
        if (!pageName || typeof pageName !== 'string') {
            return res
                .status(400)
                .json({ error: 'Please provide pageName as a query parameter' });
        }

        const timer = await PageTimer.findOne({ pageName: pageName.trim() });
        if (!timer) {
            return res.status(404).json({ error: `No timer found for "${pageName}"` });
        }

        res.status(200).json(timer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTimerById = async (req, res) => {
    try {
        const { id } = req.params;
        const timer = await PageTimer.findByIdAndDelete(id);
        if (!timer) {
            return res.status(404).json({ error: 'Timer not found' });
        }
        res.status(200).json({ message: 'Timer deleted successfully', timer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

