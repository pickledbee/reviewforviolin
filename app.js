import React from 'react';
import ReactDOM from 'react-dom';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://gtyzoghbttbeqvpdspyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXpvZ2hidHRiZXF2cGRzcHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjQ1MTEsImV4cCI6MjA1Njk0MDUxMX0.-Pf0uk0uKg0-UegxXVXxzKW_CdCSPjYhzTv6SeWbnnw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of students with details
const students = [
  { name: "Evelyn", day: "Monday", time: "3:30 PM", duration: "30 minutes" },
  { name: "Iris", day: "Monday", time: "4:15 PM", duration: "30 minutes" },
  { name: "Freya", day: "Monday", time: "6:00 PM", duration: "30 minutes" },
  { name: "Jonathan", day: "Monday", time: "6:30 PM", duration: "30 minutes" },
  { name: "Will", day: "Monday", time: "7:00 PM", duration: "30 minutes" },
  { name: "Joseph", day: "Tuesday", time: "5:30 PM", duration: "30 minutes" },
  { name: "Ana", day: "Tuesday", time: "6:00 PM", duration: "30 minutes" },
  { name: "Myra", day: "Tuesday", time: "6:30 PM", duration: "30 minutes" },
  { name: "Ben", day: "Tuesday", time: "7:00 PM", duration: "30 minutes" },
  { name: "Brianna", day: "Wednesday", time: "12:00 PM", duration: "30 minutes" },
  { name: "Edmund", day: "Wednesday", time: "1:00 PM", duration: "45 minutes" },
  { name: "Gio", day: "Wednesday", time: "4:00 PM", duration: "15 minutes" },
  { name: "Alexandra", day: "Wednesday", time: "6:30 PM", duration: "45 minutes" },
  { name: "Ryken", day: "Wednesday", time: "7:15 PM", duration: "30 minutes" },
  { name: "Callaway & Samuel", day: "Wednesday", time: "7:45 PM", duration: "1 hour" },
  { name: "Ved", day: "Thursday", time: "6:00 PM", duration: "30 minutes" },
  { name: "Valerie", day: "Wednesday", time: "4:30 PM", duration: "30 minutes" },
  { name: "Dillon", day: "Thursday", time: "5:00 PM", duration: "30 minutes" }
];

// Helper function to create a storage key using a sanitized student name.
const getStorageKey = (base, student) =>
  `${base}_${student.replace(/\W/g, "")}`;

const SuzukiReviewChart = () => {
  // State for student selection.
  const [selectedStudent, setSelectedStudent] = React.useState("");

  // Suzuki Book 1 pieces in order
  const pieces = [
    "Twinkle, Twinkle, Little Star Variations",
    "Twinkle, Twinkle, Little Star Theme",
    "Lightly Row",
    "Song of the Wind",
    "Go Tell Aunt Rhody",
    "O Come, Little Children",
    "May Song",
    "Long, Long Ago",
    "Allegro",
    "Perpetual Motion",
    "Allegretto",
    "Andantino",
    "Etude",
    "Minuet 1",
    "Minuet 2",
    "Minuet 3",
    "The Happy Farmer",
    "Gavotte"
  ];

  const [completedPractices, setCompletedPractices] = React.useState({});
  const [currentDay, setCurrentDay] = React.useState(1);
  const [teacherNotes, setTeacherNotes] = React.useState("");

  const [showTechnique, setShowTechnique] = React.useState(false);
  const [shuffledMode, setShuffledMode] = React.useState(false);
  const [shuffledPieces, setShuffledPieces] = React.useState([...pieces]);
  const [reviewSchedule, setReviewSchedule] = React.useState([]);

  const focusAreas = {
    "Bow Hand": [
      "Keep middle fingers resting on frog",
      "Maintain bent thumb touching stick",
      "Keep pinky curved on top of bow",
      "Distribute pressure evenly across fingers",
      "Keep bow hand relaxed"
    ],
    "Left Hand": [
      "Shape hand with natural curve",
      "Keep wrist straight",
      "Place thumb lightly opposite index/middle",
      "Curve all fingers on their tips",
      "Maintain 'mouse hole' space at base of index"
    ],
    "Intonation": [
      "Practice consistent finger spacing",
      "Listen for ringing tones",
      "Adjust fingers if note sounds off",
      "Leave fingers down when possible",
      "Prepare next finger in advance"
    ],
    "Tone": [
      "Use straight bow parallel to bridge",
      "Maintain consistent contact point",
      "Apply appropriate bow weight and speed",
      "Aim for even tone across strings",
      "Keep bowing arm and hand relaxed"
    ],
    "Bowing": [
      "Plan bow usage for long/short notes",
      "Track position on bow",
      "Make smooth bow changes",
      "Adjust speed/pressure for dynamics",
      "Practice controlled bow strokes"
    ],
    "Posture": [
      "Stand with balanced posture",
      "Keep shoulders down and relaxed",
      "Hold violin with jaw and collarbone",
      "Align head over spine",
      "Maintain natural arm positions"
    ]
  };

  React.useEffect(() => {
    if (selectedStudent) {
      const keyPrefix = getStorageKey("", selectedStudent);
      supabase
        .from('students')
        .select('*')
        .eq('name', selectedStudent)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setCompletedPractices(data.completedPractices || {});
            setCurrentDay(data.currentDay || 1);
            setTeacherNotes(data.teacherNotes || "");
          }
        });
    }
  }, [selectedStudent]);

  React.useEffect(() => {
    if (selectedStudent) {
      const keyPrefix = getStorageKey("", selectedStudent);
      supabase
        .from('students')
        .upsert({
          name: selectedStudent,
          completedPractices,
          currentDay,
          teacherNotes
        });
    }
  }, [completedPractices, currentDay, teacherNotes, selectedStudent]);

  React.useEffect(() => {
    updateReviewSchedule();
  }, [shuffledMode, shuffledPieces]);

  const updateReviewSchedule = () => {
    const schedule = [];
    let dayCounter = 1;
    const piecesList = shuffledMode ? shuffledPieces : pieces;

    for (let i = piecesList.length - 1; i >= 0; i -= 3) {
      const dayPieces = [];
      for (let j = 0; j < 3; j++) {
        if (i - j >= 0) {
          dayPieces.push(piecesList[i - j]);
        }
      }
      if (dayPieces.length > 0) {
        schedule.push({
          day: dayCounter,
          pieces: dayPieces,
          focusArea: Object.keys(focusAreas)[dayCounter % 6],
        });
        dayCounter++;
      }
    }
    setReviewSchedule(schedule);
  };

  const toggleCompletion = (day, piece) => {
    const key = `${day}-${piece}`;
    setCompletedPractices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const calculateProgress = (day) => {
    const dayPieces = reviewSchedule.find(d => d.day === day)?.pieces || [];
    if (dayPieces.length === 0) return 0;
    let completed = 0;
    dayPieces.forEach(piece => {
      if (completedPractices[`${day}-${piece}`]) completed++;
    });
    return Math.round((completed / dayPieces.length) * 100);
  };

  const getCurrentFocusDetails = () => {
    const focusAreaName = reviewSchedule.find(d => d.day === currentDay)?.focusArea;
    return focusAreas[focusAreaName] || [];
  };

  const resetProgress = () => {
    setCompletedPractices({});
  };

  const startNewWeek = () => {
    resetProgress();
    setCurrentDay(1);
  };

  const shufflePieces = () => {
    const piecesToShuffle = [...pieces];
    for (let i = piecesToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piecesToShuffle[i], piecesToShuffle[j]] = [piecesToShuffle[j], piecesToShuffle[i]];
    }
    setShuffledPieces(piecesToShuffle);
    setShuffledMode(!shuffledMode);
    resetProgress();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-800">Suzuki Book 1 Review Chart</h1>
      
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">Select Your Name:</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">-- Select --</option>
          {students.map((student, index) => (
            <option key={index} value={student.name}>
              {student.name} ({student.day} {student.time} for {student.duration})
            </option>
          ))}
        </select>
      </div>

      {selectedStudent ? (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Current Day: {currentDay}</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  disabled={currentDay === 1}
                >
                  Previous Day
                </button>
                <button 
                  onClick={() => setCurrentDay(prev => Math.min(reviewSchedule.length, prev + 1))}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  disabled={currentDay === reviewSchedule.length}
                >
                  Next Day
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Day {currentDay} Progress</h3>
                <span className="text-sm font-medium text-gray-600">
                  {calculateProgress(currentDay)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${calculateProgress(currentDay)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-white rounded-lg shadow">
                <div className="border-b p-4">
                  <h3 className="text-lg font-semibold">Review Pieces for Day {currentDay}</h3>
                  <p className="text-sm text-gray-600">Check off pieces as you complete them</p>
                </div>
                
                <ul className="divide-y">
                  {reviewSchedule.find(d => d.day === currentDay)?.pieces.map((piece, index) => (
                    <li key={index} className="p-4 flex items-center">
                      <input
                        type="checkbox"
                        id={`piece-${currentDay}-${index}`}
                        checked={!!completedPractices[`${currentDay}-${piece}`]}
                        onChange={() => toggleCompletion(currentDay, piece)}
                        className="h-5 w-5 text-indigo-600 rounded mr-3"
                      />
                      <label htmlFor={`piece-${currentDay}-${index}`} className="text-gray-800">
                        {piece}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={shufflePieces}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                >
                  {shuffledMode ? "Return to Original Order" : "Shuffle Pieces"}
                </button>
                <div>
                  <button 
                    onClick={resetProgress}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded mr-2"
                  >
                    Reset Day
                  </button>
                  <button 
                    onClick={startNewWeek}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                  >
                    Start New Week
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Technique Focus</h3>
                  <button 
                    onClick={() => setShowTechnique(!showTechnique)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {showTechnique ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Today's focus: <span className="font-medium">{reviewSchedule.find(d => d.day === currentDay)?.focusArea}</span>
                </p>
              </div>
              
              {showTechnique && (
                <ul className="p-4 space-y-2">
                  {getCurrentFocusDetails().map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-xs mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="p-4 bg-indigo-50 rounded-b-lg">
                <h4 className="font-medium mb-2">Technique Tips:</h4>
                <p className="text-sm text-gray-700">
                  {currentDay % 6 === 1 && "Bow Grip: Aim for relaxed fingers and curved pinky. Try gently shaking out your hand between pieces for flexibility."}
                  {currentDay % 6 === 2 && "Left Hand Form: Keep your wrist straight and fingers nicely curved on their tips for best results."}
                  {currentDay % 6 === 3 && "Intonation: Listen for ringing tones and match pitches to open strings when possible for beautiful sound."}
                  {currentDay % 6 === 4 && "Tone Quality: Practice straight bowing parallel to the bridge with a consistent contact point for clear sound."}
                  {currentDay % 6 === 5 && "Bow Control: Plan your bow distribution to create smooth, even sound throughout each stroke."}
                  {currentDay % 6 === 0 && "Posture: Check for a balanced stance. Hold the violin with your jaw to allow your left hand to move freely."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">6-Day Review Schedule</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {reviewSchedule.map((day) => (
                <div 
                  key={day.day} 
                  className={`p-3 rounded-lg shadow text-center cursor-pointer border ${currentDay === day.day ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}
                  onClick={() => setCurrentDay(day.day)}
                >
                  <h4 className="font-medium">Day {day.day}</h4>
                  <p className="text-xs text-gray-500 mb-1">{day.focusArea} Focus</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: `${calculateProgress(day.day)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Teacher Notes</h3>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              rows={4}
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Your notes are saved to the cloud and will persist across all your devices.
            </p>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-600">Please select your name to view your review chart.</p>
      )}
    </div>
  );
};

ReactDOM.render(<SuzukiReviewChart />, document.getElementById('root'));
