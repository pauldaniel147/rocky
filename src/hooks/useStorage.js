import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (key === 'pipeline') return storage.getPipeline()
    if (key === 'preferences') return storage.getPreferences()
    if (key === 'profile') return storage.getProfile()
    if (key === 'checkins') return storage.getCheckins()
    if (key === 'careerStory') return storage.getCareerStory()
    if (key === 'apiKey') return storage.getApiKey()
    return initialValue
  })

  const updateValue = (newValue) => {
    setValue(newValue)
    if (key === 'pipeline') storage.setPipeline(newValue)
    else if (key === 'preferences') storage.setPreferences(newValue)
    else if (key === 'profile') storage.setProfile(newValue)
    else if (key === 'careerStory') storage.setCareerStory(newValue)
    else if (key === 'apiKey') storage.setApiKey(newValue)
  }

  return [value, updateValue]
}

export function usePipeline() {
  const [pipeline, setPipeline] = useStorage('pipeline', [])

  const addJob = (job) => {
    const newJob = storage.addJob(job)
    setPipeline(storage.getPipeline())
    return newJob
  }

  const updateJob = (id, updates) => {
    storage.updateJob(id, updates)
    setPipeline(storage.getPipeline())
  }

  const deleteJob = (id) => {
    storage.deleteJob(id)
    setPipeline(storage.getPipeline())
  }

  const moveJob = (id, newStage) => {
    updateJob(id, { stage: newStage })
  }

  return {
    pipeline,
    addJob,
    updateJob,
    deleteJob,
    moveJob,
  }
}
