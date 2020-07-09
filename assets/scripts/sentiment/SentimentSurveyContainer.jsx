import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import SentimentSurvey from './SentimentSurvey'
import { postSentimentSurveyVote } from '../util/api'
import { trackEvent } from '../app/event_tracking'

const SURVEY_DELAY_BEFORE_APPEAR = 5000 // in ms

function SentimentSurveyContainer (props) {
  const [isVisible, setVisible] = useState(false)
  const [isDismissed, setDismissed] = useState(false)
  const street = useSelector((state) => state.street)
  const isEnabled = useSelector(
    (state) =>
      // Enabled when the feature flag is true
      state.flags.SENTIMENT_SURVEY?.value === true &&
      // Enabled if locale is English (or any other supported locale; for
      // now, this is going to be hard-coded when needed)
      ['en', 'es-419'].includes(state.locale.locale) &&
      // Enabled if user is signed in
      state.user.signedIn === true &&
      // Show if user is not the same the current street's creator
      state.user.signInData.userId !== street.creatorId &&
      // Show if gallery is not open
      state.gallery.visible === false &&
      // Show if the street is geolocated
      street.location !== null &&
      // Show if the street has had more than a number of edits to it
      street.editCount > 10 &&
      // Show if the street segments fit street width exactly
      street.remainingWidth === 0
  )

  useEffect(() => {
    if (!isDismissed) {
      window.setTimeout(() => {
        setVisible(true)
      }, SURVEY_DELAY_BEFORE_APPEAR)
    }
  })

  useEffect(() => {
    if (isEnabled) {
      trackEvent('INTERACTION', 'Sentiment survey viewed', null, null, false)
    }
  })

  function handleClose () {
    setDismissed(true)
    setVisible(false)
  }

  function handleVote (score) {
    // Post the vote information immediately
    // Let's allow this to fail silently (if there is a problem, the user
    // doesn't need to know, but we still log the error internally)
    try {
      postSentimentSurveyVote({
        score,
        data: street,
        streetId: street.id
      })
    } catch (error) {
      console.error(error)
    }

    trackEvent('INTERACTION', 'Sentiment survey voted', null, score, false)

    // There will be some visual confirmation of the vote, after that,
    // the UI closes automatically
    window.setTimeout(handleClose, 2500)
  }

  if (isEnabled) {
    return (
      <SentimentSurvey
        visible={isVisible}
        onClose={handleClose}
        handleVote={handleVote}
      />
    )
  }

  return null
}

export default SentimentSurveyContainer