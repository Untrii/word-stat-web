import { existsSync } from 'node:fs'
import { open } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'node-html-parser'

const GENIUS_LINK_PREFIX = 'https://genius.com/artists/'

const tryFetch: typeof fetch = async (input: RequestInfo, init: RequestInit) => {
  let attemptCount = 0

  while (attemptCount < 3) {
    try {
      return await fetch(input, init)
    } catch (error) {
      attemptCount++
      if (attemptCount == 3) {
        throw error
      }
    }
  }
}

export default function createGeniusParser() {
  let isJobRunning = false
  let jobProgress = 0
  let jobMaxProgress = 0
  let currentJob: string | null = null

  async function getArtistId(artistLink: string) {
    let pageHtml = ''

    try {
      const pageResponse = await tryFetch(artistLink)
      pageHtml = await pageResponse.text()
    } catch {}

    const regex = /<meta content="\/artists\/(\d+)" name="newrelic-resource-path" \/>/
    const matches = pageHtml.match(regex)
    if (!matches) return -1

    const id = Number(matches[1])

    if (isNaN(id)) return -1
    return id
  }

  async function getArtistSongUrls(artistId: number): Promise<string[]> {
    let nextPage = 1
    const songUrls: string[] = []

    while (nextPage) {
      let songs: Record<string, unknown> = {}

      try {
        const songsResponse = await tryFetch(
          `https://genius.com/api/artists/${artistId}/songs?page=${nextPage}&sort=popularity`,
        )
        songs = await songsResponse.json()
      } catch {}

      console.log(`Downloaded songs of ${artistId} page ${nextPage}`)

      if (typeof songs.response == 'object') {
        nextPage = (songs.response as Record<string, any>).next_page
        const songList = (songs.response as Record<string, unknown>).songs

        if (Array.isArray(songList)) {
          for (const song of songList) {
            songUrls.push(song.url)
          }
        }
      } else {
        nextPage = null
      }
    }

    return songUrls
  }

  async function getSongLyrics(songUrl: string): Promise<string> {
    let songHtml = ''

    try {
      const songResponse = await tryFetch(songUrl)
      songHtml = await songResponse.text()
    } catch {}

    const vdom = parse(songHtml.replaceAll('<br/>', '\n'))
    const lyricsContainer = vdom.querySelectorAll('[data-lyrics-container]')

    jobProgress++
    console.log(`Got song ${jobProgress} of ${jobMaxProgress}`)

    if (!lyricsContainer) return ''
    return lyricsContainer.map(item => item.innerText).join('\n') + '\n'
  }

  async function finishJob(artistSlug: string, songsLyrics: string[]) {
    try {
      const fileHandle = await open(
        path.join(process.env.LYRICS_DOWNLOAD_FOLDER, artistSlug + '.txt'),
        'w',
      )

      for (const songLyrics of songsLyrics) {
        await fileHandle.write(songLyrics + '\n', null, 'utf-8')
      }

      await fileHandle.close()
    } catch (error) {
      console.log(error)
    }

    currentJob = null
  }

  async function runJob(artistLink: string) {
    if (isJobRunning) return
    isJobRunning = true

    const artistSlug = artistLink.replace(GENIUS_LINK_PREFIX, '')

    jobProgress = 0
    currentJob = artistLink

    const artistId = await getArtistId(artistLink)
    if (artistId === -1) {
      currentJob = null
      return
    }

    if (existsSync(path.join(process.env.LYRICS_DOWNLOAD_FOLDER, artistSlug + '.txt'))) {
      currentJob = null
      return
    }

    const artistSongUrls = await getArtistSongUrls(artistId)

    jobMaxProgress = artistSongUrls.length

    const songLyrics: string[] = []

    for (const songUrl of artistSongUrls) {
      songLyrics.push(await getSongLyrics(songUrl))
    }

    await finishJob(artistSlug, songLyrics)

    currentJob = null
  }

  return {
    runJob,
    get isJobRunning() {
      return isJobRunning
    },

    get currentJob() {
      return currentJob
    },

    get jobProgress() {
      if (!currentJob) return 0
      return jobProgress
    },

    get jobMaxProgress() {
      if (!currentJob) return 0
      return jobMaxProgress
    },
  }
}
