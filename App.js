import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal } from 'react-native';
import * as Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';


export default function App() {
  const [shifts, setShifts] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timer, setTimer] = useState(0);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  
  useEffect(() => {
    let interval = null;

    if (startTime) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  const formatTime = (time) => {
    const pad = (num) => (num < 10 ? `0${num}` : num);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const startTimer = () => {
    setTaskModalVisible(true);
  };

  const endTimer = () => {
    if (startTime) {
      const currentTime = new Date();
      setEndTime(currentTime);
      const duration = Math.floor((currentTime - startTime) / 1000);
      const shift = {
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: formatTime(duration),
        task: selectedTask,
      };
      setShifts([...shifts, shift]);
      setStartTime(currentTime); // Start the next timer immediately
      setEndTime(null);
      setTimer(0);
      setTaskModalVisible(true); // Show the task modal again for the next timer
    }
  };

  const endShift = () => {
    if (startTime) {
      const currentTime = new Date();
      setEndTime(currentTime);
      const duration = Math.floor((currentTime - startTime) / 1000);
      const shift = {
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: formatTime(duration),
        task: selectedTask,
      };
      setShifts([...shifts, shift]);
    }
    setStartTime(null);
    setEndTime(null);
    setTimer(0);
    setSelectedTask('');
  };

  const handleTaskSelection = (task) => {
    setSelectedTask(task);
    setTaskModalVisible(false);
    setStartTime(new Date());
  };

  const exportToCSV = async () => {
    const csvData = Papa.unparse(shifts, { header: true });
    const currentDate = moment().format('YYYY-MM-DD');
    const fileName = `shifts_${currentDate}.csv`;
    const csvFilePath = `${FileSystem.documentDirectory}${fileName}`;
  
    await FileSystem.writeAsStringAsync(csvFilePath, csvData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  
    Sharing.shareAsync(csvFilePath);
  };

  
  const renderTaskModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={taskModalVisible}
      onRequestClose={() => setTaskModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Task</Text>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Clinical')}>
            <Text style={styles.taskButtonText}>Clinical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Non-Clinical')}>
            <Text style={styles.taskButtonText}>Non-Clinical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Billable')}>
            <Text style={styles.taskButtonText}>Billable</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Non-Billable')}>
            <Text style={styles.taskButtonText}>Non-Billable</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Education')}>
            <Text style={styles.taskButtonText}>Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => handleTaskSelection('Break')}>
            <Text style={styles.taskButtonText}>Break</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>
      {!startTime && (
        <TouchableOpacity style={styles.buttonStart} onPress={startTimer}>
          <Text style={styles.buttonText}>Start Timer</Text>
        </TouchableOpacity>
      )}
      {startTime && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonEnd} onPress={endTimer}>
            <Text style={styles.buttonText}>End Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonEnd2} onPress={endShift}>
            <Text style={styles.buttonText}>End Shift</Text>
          </TouchableOpacity>
        </View>
      )}
      {renderTaskModal()}
      <View style={styles.shiftsContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Start Time</Text>
          <Text style={styles.tableHeaderText}>End Time</Text>
          <Text style={styles.tableHeaderText}>Duration</Text>
          <Text style={styles.tableHeaderText}>Task</Text>
        </View>
        <FlatList
          data={shifts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.shiftItem}>
              <Text style={styles.shiftItemText}>{item.startTime}</Text>
              <Text style={styles.shiftItemText}>{item.endTime}</Text>
              <Text style={styles.shiftItemText}>{item.duration}</Text>
              <Text style={styles.shiftItemText}>{item.task}</Text>
            </View>
          )}
        />
      </View> 
      <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
        <Text style={styles.exportButtonText}>Export to CSV</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF8',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  timerContainer: {
    marginTop: 50,
    marginBottom: 20,
  },
  timer: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  buttonStart: {
    backgroundColor: '#2D669E',
    padding: 10,
    paddginVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonEnd: {
    backgroundColor: '#E85E5E',
    padding: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonEnd2: {
    backgroundColor: '#A03D3D',
    padding: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    width: '25%',
    textAlign: 'center'
  },
  shiftsContainer: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#F2F2F9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2
  },  
  shiftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  shiftItemText: {
    width: '25%',
    textAlign: 'center',
  },  
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  exportButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  taskButton: {
    backgroundColor: '#2D669E',
    padding: 18,
    marginVertical: 5,
    borderRadius: 5,
  },
  taskButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlign: 'center',
  },
});
