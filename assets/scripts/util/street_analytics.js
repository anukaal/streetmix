import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
// import store from '../store'
import memoizeFormatConstructor from './memoized_formatting'

// take in a street and returns a list of segments with analytics info
const getAnalyticsFromStreet = (street, locale) => {
  const segments = street.segments.map(segment => {
    const variant = (getSegmentVariantInfo(segment.type, segment.variantString) || {}).analytics
    const type = (getSegmentInfo(segment.type) || {}).analytics
    return { variant, type }
  })
  return { segments, street }
}

const NO_CAPACITY = { average: 0, potential: 0 }

const CAPACITIES = {
  sidewalk: { average: 19000, potential: 19000 },
  'drive-lane': { average: 1500, potential: 2000 },
  'bike-lane': { average: 14000, potential: 14000 },
  scooter: { average: 14000, potential: 14000 },
  'light-rail': { average: 18000, potential: 20000 },
  streetcar: { average: 18000, potential: 20000 },
  'bus-lane': { average: 5000, potential: 8000 }
}

export const getCapacity = (type) => {
  return CAPACITIES[type] || NO_CAPACITY
}

const sumFunc = (total, num) => {
  return total + num
}

const addSegmentData = item => {
  return {
    label: `${item.variantString} ${item.type}`,
    capacity: getCapacity(item.type),
    segment: item
  }
}

const NumberFormat = memoizeFormatConstructor(Intl.NumberFormat)

export const formatCapacity = (amount, locale) => {
  return NumberFormat(locale).format(amount)
}

export const getSegmentCapacity = (segment) => {
  return addSegmentData(segment)
}

export const getStreetCapacity = (street) => {
  const { segments } = street
  const segmentData = segments.map(addSegmentData)
  const averageTotal = segmentData.map(item => item.capacity.average).reduce(sumFunc)
  const potentialTotal = segmentData.map(item => item.capacity.potential).reduce(sumFunc)

  return {
    segmentData,
    averageTotal,
    potentialTotal
  }
}

export default getAnalyticsFromStreet
