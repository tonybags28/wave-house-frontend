import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { X, Calendar, Clock, User, Music, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const BookingModal = ({ isOpen, onClose, preSelectedService }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [duration, setDuration] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [bookedSlots, setBookedSlots] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingResponse, setBookingResponse] = useState(null)

  const services = [
    { id: 'studio-access', name: 'Studio Access (No Engineer)', description: 'Book the studio and bring your own team' },
    { id: 'engineer-request', name: 'Engineer Request', description: 'Request an engineer for your session' },
    { id: 'mixing', name: 'Mixing Services', description: 'Professional mixing services' }
  ]

  const durations = [
    { value: '4', label: '4 Hours', price: '$100' },
    { value: '6', label: '6 Hours', price: '$130' },
    { value: '8', label: '8 Hours', price: '$160' },
    { value: '12', label: '12 Hours', price: '$230' },
    { value: '24', label: 'Full Day (24hrs)', price: '$400' }
  ]

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
    '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM',
    '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM',
    '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'
  ]

  // Set pre-selected service if provided
  useEffect(() => {
    if (preSelectedService) {
      setSelectedService(preSelectedService)
    }
  }, [preSelectedService])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedService(preSelectedService || null)
      setDuration(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        message: ''
      })
      setShowSuccess(false)
      setBookingResponse(null)
    }
  }, [isOpen, preSelectedService])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const calendarDays = []
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    calendarDays.push(date)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(prevMonth.getMonth() - 1)
      return newMonth
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(prevMonth.getMonth() + 1)
      return newMonth
    })
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Submit booking directly - no verification popup
      let endpoint = 'https://wave-house-backend-clean.onrender.com/api/bookings'
      let data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      }

      if (selectedService === 'studio-access') {
        data = {
          ...data,
          service_type: selectedService,
          date: selectedDate?.toISOString().split('T')[0],
          time: selectedTime,
          duration: duration,
          project_type: formData.projectType
        }
      } else if (selectedService === 'engineer-request') {
        data = {
          ...data,
          service_type: selectedService,
          preferred_dates: formData.message
        }
      } else if (selectedService === 'mixing') {
        data = {
          ...data,
          service_type: selectedService,
          project_details: formData.message
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        setBookingResponse(result)
        setShowSuccess(true)
      } else {
        alert('Error submitting booking. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('Error submitting booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Book Your Session</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {!showSuccess ? (
            <>
              {/* Service Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Music className="h-5 w-5 mr-2 text-cyan-400" />
                  Select Service
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedService === service.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold text-white mb-2">{service.name}</h4>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Studio Access Options */}
              {selectedService === 'studio-access' && (
                <>
                  {/* Duration Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-cyan-400" />
                      Select Duration
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {durations.map((dur) => (
                        <Button
                          key={dur.value}
                          type="button"
                          variant={duration === dur.value ? "default" : "outline"}
                          onClick={() => setDuration(dur.value)}
                          className={`p-3 h-auto flex flex-col ${
                            duration === dur.value
                              ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                              : 'border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400'
                          }`}
                        >
                          <span className="font-semibold">{dur.label}</span>
                          <span className="text-sm opacity-80">{dur.price}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                      Select Date
                    </h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <div className="flex justify-between items-center mb-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handlePrevMonth}
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h4 className="text-lg font-semibold text-white">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleNextMonth}
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!day || day < today}
                            onClick={() => day && setSelectedDate(day)}
                            className={`h-10 p-0 ${
                              !day
                                ? 'invisible'
                                : day < today
                                ? 'text-gray-600 cursor-not-allowed'
                                : selectedDate && day.getTime() === selectedDate.getTime()
                                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            {day?.getDate()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-cyan-400" />
                        Select Start Time
                      </h3>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={`${
                              selectedTime === time
                                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400'
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-cyan-400" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {selectedService === 'studio-access' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
                      <select
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select project type</option>
                        <option value="recording">Recording</option>
                        <option value="mixing">Mixing</option>
                        <option value="mastering">Mastering</option>
                        <option value="production">Production</option>
                        <option value="podcast">Podcast</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {selectedService === 'studio-access' ? 'Additional Notes' :
                     selectedService === 'engineer-request' ? 'Project Details *' :
                     'Project Details *'}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required={selectedService !== 'studio-access'}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder={
                      selectedService === 'studio-access' 
                        ? "Any special requirements or notes about your session..."
                        : selectedService === 'engineer-request'
                        ? "Please describe your project, preferred dates, and engineer requirements..."
                        : "Please describe your project, number of stems, genre, timeline, and any specific mixing requirements..."
                    }
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:border-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.email || (selectedService === 'studio-access' && (!selectedDate || !selectedTime || !duration))}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 
                   selectedService === 'studio-access' ? 'Submit Booking Request' :
                   selectedService === 'engineer-request' ? 'Submit Engineer Request' :
                   'Submit Mixing Request'}
                </Button>
              </div>
            </>
          ) : (
            /* Success Message */
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Request Submitted Successfully!</h3>
                <p className="text-gray-300 mb-4">
                  {selectedService === 'studio-access' 
                    ? 'Your booking request has been submitted. We will contact you within 24 hours to confirm your session. If this is your first time booking with us, you will receive an email with ID verification instructions.'
                    : selectedService === 'engineer-request'
                    ? 'Your engineer request has been submitted. We will contact you within 24 hours with available engineers.'
                    : 'Your mixing services request has been submitted. We will contact you within 24 hours to discuss your project.'
                  }
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setShowSuccess(false)
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setSelectedService(null)
                  setDuration(null)
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    projectType: '',
                    message: ''
                  })
                  setBookingResponse(null)
                  onClose()
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default BookingModal

