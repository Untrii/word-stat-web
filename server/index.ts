import path from 'node:path'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import express from 'express'
import { handler as svelteSsr } from '../client/build/handler.js'
import createGeniusParser from './createGeniusParser.js'
import createQueue from './createQueue.js'

dotenv.config()

const app = express()
const geniusParser = createGeniusParser()
const analysisQueue = createQueue(geniusParser.runJob)

const GENIUS_LINK_PREFIX = 'https://genius.com/artists/'

app.get('/api/status', (req, res) => {
  const artistLink = req.query.q as string

  if (!artistLink || !artistLink.startsWith(GENIUS_LINK_PREFIX)) {
    res.status(400).send({ error: 'Incorrect artist link' })
  }

  const artistSlug = artistLink.replace(GENIUS_LINK_PREFIX, '')
  const artistLyricsPath = path.join(process.env.LYRICS_DOWNLOAD_FOLDER, artistSlug + '.txt')
  const artistStatPath = path.join(process.env.LYRICS_DOWNLOAD_FOLDER, artistSlug + '.txt')

  res.status(200)
  if (existsSync(artistLyricsPath)) {
    return res.send({
      status: 'FINISHING_UP',
    })
  }

  if (existsSync(artistStatPath)) {
    return res.send({
      status: 'DONE',
    })
  }

  const clientIp = req.socket.remoteAddress
  if (!analysisQueue.hasRequest(artistLink)) analysisQueue.addRequest(clientIp, artistLink)

  if (geniusParser.currentJob === artistLink) {
    if (geniusParser.jobProgress === 0) {
      res.send({
        status: 'ANALYSIS_PREPARING',
      })
    } else {
      res.send({
        status: 'ANALYZING',
        analysisProgress: geniusParser.jobProgress,
        analysisMaxProgress: geniusParser.jobMaxProgress,
      })
    }

    return
  }

  res.send({
    status: 'QUEUED',
    queueNumber: analysisQueue.getRequestPosition(artistLink),
  })
})

app.use(svelteSsr)
app.listen(3000)
