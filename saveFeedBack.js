  // =========================
// SAVE FEEDBACK (ASYNC STORAGE)
// =========================
const saveFeedbackWord = async (text) => {
  try {
    const key = "feedback_words";

    // Normalize text
    const cleaned = text.trim().toLowerCase();

    // Read existing items
    const existing = await AsyncStorage.getItem(key);
    let arr = existing ? JSON.parse(existing) : [];

    // Avoid duplicates
    if (!arr.includes(cleaned)) {
      arr.push(cleaned);
      await AsyncStorage.setItem(key, JSON.stringify(arr));
      console.log("🔥 Saved feedback:", cleaned);
    }
  } catch (err) {
    console.log("❌ Error saving feedback:", err);
  }
};

// Read feedback words
const getFeedbackWords = async () => {
  try {
    const data = await AsyncStorage.getItem("feedback_words");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log("❌ Error reading feedback:", err);
    return [];
  }
};

// Clear feedback (optional)
const clearFeedback = async () => {
  try {
    await AsyncStorage.removeItem("feedback_words");
    console.log("🧹 Feedback cleared");
  } catch (err) {
    console.log("❌ Error clearing feedback:", err);
  }
};


// modal for feedback 
  {showDev && (
                    <View style={{
                        position: "absolute",
                        top: 50,
                        left: "5%",
                        width: "90%",
                        height: "80%",
                        backgroundColor: "white",
                        borderRadius: 15,
                        padding: 20,
                        zIndex: 999
                    }}>
                      
                      <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, color:"black"}}>
                        Developer Feedback Log
                      </Text>

                      <TouchableOpacity 
                        style={{
                          alignSelf: "flex-end",
                          padding: 10,
                          backgroundColor: "black",
                          borderRadius: 8
                        }}
                        onPress={() => setShowDev(false)}
                      >
                        <Text style={{color: "white", fontSize: 18}}>Close</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          marginTop: 15,
                          backgroundColor: "green",
                          padding: 10,
                          borderRadius: 8
                        }}
                        onPress={async () => {
                          let list = await getFeedbackWords();
                          setFeedbackList(list);
                        }}
                      >
                        <Text style={{color:"white", fontWeight:"bold"}}>Load Feedback</Text>
                      </TouchableOpacity>

                      <FlatList
                        style={{marginTop: 20}}
                        data={feedbackList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <View style={{
                            padding: 10,
                            backgroundColor:"#f0f0f0",
                            borderRadius:8,
                            marginBottom:10
                          }}>
                            <Text style={{color:"black"}}>{item}</Text>
                          </View>
                        )}
                      />

                      <TouchableOpacity
                        style={{
                          marginTop: 15,
                          backgroundColor: "red",
                          padding: 10,
                          borderRadius: 8
                        }}
                        onPress={async () => {
                          await clearFeedback();
                          setFeedbackList([]);
                        }}
                      >
                        <Text style={{color:"white", fontWeight:"bold"}}>Clear All Feedback</Text>
                      </TouchableOpacity>

                    </View>
            )}
