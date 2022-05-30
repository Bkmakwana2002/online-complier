const express = require('express')
const app = express()
const { generateFile } = require('./genrateFile')
const { executeCpp } = require('./executeCpp')
const { executePy } = require('./executePy')
const cors = require('cors')
const mongoose = require('mongoose')
const Job = require('./models/Job')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// const dbUri = "mongodb+srv://bkm:bkm@cluster0.n05m0.mongodb.net/?retryWrites=true&w=majority"
const dbUri = "mongodb://0.0.0.0:27017/complier"

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => app.listen(5000, function () {
        console.log("SERVER RUNNING")
    }))


app.get("/status", async (req, res) => {
    const jobId = req.query.id;
    if (jobId === undefined) {
        return res
            .status(400)
            .json({ success: false, error: "missing id query param" });
    }

    const job = await Job.findById(jobId);
    console.log(job)

    if (job === undefined) {
        return res.status(400).json({ success: false, error: "couldn't find job" });
    }

    return res.status(200).json({ success: true, job });
})

app.post('/run', async (req, res) => {
    const { language = "cpp", code } = req.body
    console.log(language, code.length)

    if (code == undefined) {
        return res.status(400).send('Code is required')
    }

    let job

    try {
        const filePath = await generateFile(language, code)

        job = await new Job({ language: language, filePath: filePath }).save();
        const jobId = job._id

        res.status(201).json({ success: true, jobId: jobId })

        let output
        job.startedAt = new Date()
        if (language == "cpp") {
            output = await executeCpp(filePath)
        }
        else {
            output = await executePy(filePath)
        }

        job.completedAt = new Date()
        job.status = "success"
        job.output = output

        await job.save()

        console.log(job)

        // return res.json({ filePath, output })
    } catch (error) {

        job.completedAt = new Date()
        job.status = "error"
        job.output = JSON.stringify(error)
        await job.save()
        console.log(job)

        console.log(error.message)
        //res.status(500).json({ error: error.message })
    }
})
