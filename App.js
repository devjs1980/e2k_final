import React, { useEffect, useRef,  useState } from 'react';
import {  StyleSheet, View, Text, TextInput, Image, TouchableOpacity, Linking,Keyboard,Animated, FlatList } from 'react-native';
import dictionary from './translation_files/dictionary.json';
import Sound from 'react-native-sound';
import FontAwesome from "react-native-vector-icons/FontAwesome";
// async storage import 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Swipeable } from "react-native-gesture-handler";
import DeviceInfo from "react-native-device-info"; 








let sound;



 

const App = () => {

  useEffect(() => {
  loadHistory();
}, []);

// send to server 
const sendToServer = async (text) => {
  try {

    // FIX: Always convert device ID to a real string
    let deviceId = DeviceInfo.getUniqueId();
    if (deviceId && typeof deviceId.then === "function") {
      deviceId = await deviceId; // if it's a Promise, await it
    }
    deviceId = String(deviceId); // force convert to string

    await fetch("https://creole-api.onrender.com/save-input", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        date: new Date().toISOString(),
        device: deviceId,
      }),
    });

    console.log("Sent to server!", deviceId);

  } catch (error) {
    console.log("API error:", error);
  }
};

const loadHistory = async () => {
  try {
    const saved = await AsyncStorage.getItem("translation_history");
    if (saved) setHistory(JSON.parse(saved));
  } catch (e) {
    console.log("Error loading history", e);
  }
};

const formatDate = () => {
  const d = new Date();
  const hours = d.getHours() % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";

  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}  ${hours}:${minutes} ${ampm}`;
};



  let pronoun_key = Object.keys(dictionary.pronouns);
  let verb_key = Object.keys(dictionary.verbs);
  let pos_pronoun_key = Object.keys(dictionary.pos_pronouns);
  let noun_key = Object.keys(dictionary.nouns);


  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [combined_word, setCombined_word] = useState("");
  const [alert, setAlert] = useState("");
  const [sugContainer, setSugContainer] = useState(true);

  // states for asyncstorage 
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);



// Prepare expressions list for FlatList
const expressionList = Object.keys(dictionary.expressions);

const handleSuggestionPress = (item) => {
  const kreyol = dictionary.expressions[item];

  setInput(item);           // mete fraz angle a nan input
  setTranslation(kreyol);   // tradui l touswit
  setCombined_word("");     // reset combined_word
  setSugContainer(true);    // fèmen sug modal
  setAlert("");
};



 let input_text = input.trim().toLowerCase();



    //  tout konsonn yo 
          const consonants = [
        'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
        'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'
      ];
    //  tout vwayel yo 
          const vowels = ["a","e","i","o","u","è", "ò" ];

     //fonksyon poun gade si teks la gen chif ladann
      function genNimewo(text) {
          return /\d/.test(text);
      }


       //fonksyon poun gade si mo gen yon sel silab
      function isOneSyllable(word) {
          word = word.toLowerCase();
          // retire karaktè espesyal
          word = word.replace(/[^a-z]/g, "");

          // konte vwayèl yo (a, e, i, o, u, y)
          let syllables = word.match(/[aeiouy]+/g);

          if (!syllables) return false;

          // retire 'e' final si li pa fè son (tankou "make" → 1 silab)
          if (word.endsWith("e")) {
            syllables.pop();
          }

          // konte konbyen silab ki rete
          let count = syllables.length;

          return count === 1;
        }


        // fonksyon pou chanje mo
        const word_replace = (word_to_replace, word_replace_to) => {
        if(input_text.includes(word_to_replace)){
          let replace_text = input_text.replace(word_to_replace, word_replace_to);
          input_text = replace_text;
        
        };
       }

      
    

        function isAdjective(text){
        for(const [key, value] of Object.entries(dictionary.adjectives)){
          if(text === key){
            return value;
          }else {
            null;
          }
        }
      }

      
    
    const handleTranslate = () => {
     
      // lew klike nan bouton translate, lazy Keyboard la ap disparet 
      Keyboard.dismiss();

      // kod sa lye ak asyncstorage 
      if (input_text.length > 0) {
          saveInputToHistory(input_text);
          sendToServer(input_text);
        }

    // si teks la pi long ke 36 karaktè nou pap tradwil. nap voye yon mesaj 
     if(input_text.length > 40){

      if(setTranslation || setCombined_word){
        setTranslation("");
        setCombined_word("")
      }

      setTimeout(() => {
        setAlert("");
      },3000);

      setAlert("Oops, text is too long")
      return;
      
    }

   
    
    // tyeke si sa teks la nan ekspresyon yo
    if(dictionary.expressions[input_text]){
      setTranslation(dictionary.expressions[input_text]); 
      setCombined_word("");
 
    }
 
     // tyeke si sa teks la nan non yo
    else if(dictionary.nouns[input_text]){
       setTranslation(dictionary.nouns[input_text]); 
        setCombined_word("");
     
    }
    // si teks la pa ni nan ekspresyon yo oubyen non yo, nou pral konbine mo yo
    else{

        // ranplase yon mo pa yon lot mo
      word_replace("wait for", "wait");
      word_replace("what do", "what");
      word_replace("years old", "years");
      word_replace("i'm", "i am");
      word_replace("you're", "you are");
      word_replace("he's", "he is");
      word_replace("she's", "she is");
      word_replace("we're", "we are");
      word_replace("the're", "they are");
      word_replace("would like to", "would like");
      word_replace("let's", "an'n");
      word_replace("right now", "now");
      word_replace("do not", "don't");
      word_replace("did not", "didn't");
      word_replace("does not", "doesn't");
      word_replace("am not", "ain't");
      word_replace("are not", "aren't");
      word_replace("is not", "isn't");
      word_replace("was not", "wasn't");
      word_replace("were not", "weren't");
      word_replace("can not", "can't");
      word_replace("should not", "shouldn't");
      word_replace("would not", "wouldn't");
      word_replace("i've", "i have");
      word_replace("you've", "you have");
      word_replace("what is up", "what's up");
      word_replace("where is", "kote");
      word_replace("where are", "kote");
      // word_replace("going", "pral");


       let translated = "";

      

       let result = [];
       let missing_word = [];

         //  pou sere "missing words or not existed words" 
     



      // separe mo yo e fome yon array avek yo 
      let words = input_text.split(/\s+/);
      //  loop nan array a poun pran chak grenn mo pa mo 
      for( let i = 0; i < words.length; i++){
        let word = words[i];
     
            // jwenn vale mo yo an kreyol 
      let pronoun = dictionary.pronouns[word];
      let pos_pronoun = dictionary.pos_pronouns[word];
      let article = dictionary.articles[word];
      let def_article = dictionary.definite_articles[word];
      let indef_article = dictionary.indefinite_articles[word];
      let verb = dictionary.verbs[word];
      let preposition = dictionary.prepositions[word];
      let conjunction = dictionary.conjunctions[word];
      let noun = dictionary.nouns[word];
      let adverb = dictionary.adverbs[word];
      let expression = dictionary.expressions[word];
      let number = dictionary.numbers[word];
      let adjective = dictionary.adjectives[word];
      let to_be = dictionary.to_be[word];
      let interrogative = dictionary.interrogatives[word];
      let modal_verb = dictionary.modal_verbs[word];
      let negation = dictionary.negations[word];
      // let question_verb = dictionary.question_verbs[word];


    

      
     
      // retire "s" nan yon mo si li nan non yo selman 
      if (word.endsWith("s")) {
          const nounKeys = Object.keys(dictionary.nouns); 

          const singular = word.slice(0, -1);  // retire s la
        
          if (nounKeys.includes(singular)) {
            word = singular;   // se vrèman yon non (dog → dogs)
           
          }
      }


    
      
      let nextWord = words[i + 1];

// modal verb 
 if(word === "would" && nextWord){
          const kreyolModal = dictionary.modal_verbs["would"]; // "ka"

          if(dictionary.pronouns[nextWord]){
            translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
          } else {
            translated = `eske ${nextWord} ${kreyolModal}`;
          }
          i++;
   }

else if(word === "could" && nextWord){
      const kreyolModal = dictionary.modal_verbs["could"]; // "te ka"

      if(dictionary.pronouns[nextWord]){
        translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
      } else {
        translated = `eske ${nextWord} ${kreyolModal}`;
      }
      i++;
}

else if(word === "can" && nextWord){
      const kreyolModal = dictionary.modal_verbs["can"]; // "te ka"

      if(dictionary.pronouns[nextWord]){
        translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
      } else {
        translated = `eske ${nextWord} ${kreyolModal}`;
      }
      i++;
}

else if(word === "would" && nextWord){
        const kreyolModal = dictionary.modal_verbs["would"]; // "te ka"

        if(dictionary.pronouns[nextWord]){
          translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
        } else {
          translated = `eske ${nextWord} ${kreyolModal}`;
        }
        i++;
}

else if(word === "must" && nextWord){
        const kreyolModal = dictionary.modal_verbs["must"]; // "te ka"

        if(dictionary.pronouns[nextWord]){
          translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
        } else {
          translated = `eske ${nextWord} ${kreyolModal}`;
        }
        i++;
}

else if(word === "should" && nextWord){
        const kreyolModal = dictionary.modal_verbs["should"]; // "te ka"

        if(dictionary.pronouns[nextWord]){
          translated = `eske ${dictionary.pronouns[nextWord]} ${kreyolModal}`;
        } else {
          translated = `eske ${nextWord} ${kreyolModal}`;
        }
        i++;
}

else if(word === "did" && nextWord){
        const kreyolModal = dictionary.modal_verbs["did"]; // "te "

        if(dictionary.pronouns[nextWord]){
          translated = `${dictionary.pronouns[nextWord]} ${kreyolModal}`;
        } else {
          translated = `${nextWord} ${kreyolModal}`;
        }
        i++;
}

else if(word === "to" && dictionary.verbs[nextWord]){
  translated = `${dictionary.verbs[nextWord]}`;
  i++;
}

else if(to_be && nextWord === "going"){
  nextWord = "pral";
  translated = `${nextWord}`;
  i++;
}

else if(pronoun && nextWord === "going"){
  nextWord = "prale";
  translated = `${pronoun} ${nextWord}`;
  i++;
}

// question verbs like "do" "did" "was" 


        // itilizasyon de atik avek non. fè "the table" = "tab la" 
else if(article && nextWord){
       
          let noun_next_word = dictionary.nouns[nextWord];
          if(!noun_next_word){
            setAlert("sorry! no translation available yet...");
            setTranslation("");
            setCombined_word("");
            return;
          }
    
          // chache denye lèt ki nan non an 
          const lastletter = noun_next_word[noun_next_word.length - 1];

          if(vowels.includes(lastletter)){
            article = "a"
          }

          else if(lastletter === "n"){
            article = "an"
          }

          else if(lastletter === "m"){
            article = "nan"
          }

          else {
            article = "la"
          }
          

          translated = `${noun_next_word} ${article}`;
          i++;
         
    } 

    
      
        // definite articles
        else if(def_article && nextWord) {
           
            if(nextWord.endsWith(`ies`) && nextWord !== "lies"){
              nextWord = nextWord.slice(0, -3) + "y";
              
            }

            else if(nextWord.endsWith(`s`)){
              nextWord = nextWord.slice(0, -1);
              
              
            } 

            nextWord = dictionary.nouns[nextWord];

            translated = `${nextWord} ${def_article}`;
            i++;
        }

  //  fonksyonalite lè "to_be" kole ak "pos_pronouns" 
  else if(to_be && dictionary.pos_pronouns[nextWord]){

    translated = `se`
  }

  
        // to_be - diferan sinifikasyon "se/ap/tap"
    else if(to_be && nextWord){
         
        
          if(genNimewo(nextWord)){
            to_be = "genyen";
            translated = `${to_be} ${nextWord}`;
            i++;
          }

          else if(nextWord.endsWith("ing")){
            nextWord = nextWord.slice(0, -3);
           
              if(word === "am" || word === "is" || word === "are"){
                to_be = "ap"
              }else if(word === "was" || word === "were" ) {
                to_be = "tap"
              }


                const last_consonant = nextWord[nextWord.length - 1];
                const sec_bef_last_consonant = nextWord[nextWord.length - 2];

             if(last_consonant === sec_bef_last_consonant ){
               
                 nextWord = dictionary.verbs[nextWord.slice(0, -1)];
                //  nextWord = dictionary.verbs[nextWord];
                   translated = `${to_be} ${nextWord}`;
                   i++;
         
              }

              else if(consonants.includes(last_consonant) && consonants.includes(sec_bef_last_consonant) ){
                
                //  nextWord = dictionary.verbs[nextWord.slice(0, -1)];
                 nextWord = dictionary.verbs[nextWord];
                   translated = `${to_be} ${nextWord}`;
                   i++;
         
              }



              else if(consonants.includes(nextWord[nextWord.length - 1]) && vowels.includes(nextWord[nextWord.length - 2])){
                     let add_e = nextWord + "e";
                     let verb = Object.keys(dictionary.verbs);
                     if(verb.includes(add_e)){
                        nextWord = dictionary.verbs[add_e];
                     }else {
                       nextWord = add_e.slice(0, -1);
                       nextWord = dictionary.verbs[nextWord];
                     }
             
                     translated = `${to_be} ${nextWord}`;
                     i++;
              }
              
              // lew retire "ing" si se "y" ki denye lèt la
              else if(nextWord.endsWith("y")){
                  if(isOneSyllable(nextWord)){
                    let add_ie = nextWord.slice(0, -1) + "ie";
                     nextWord = dictionary.verbs[add_ie];
                  }else{
                    nextWord = dictionary.verbs[nextWord]
                  }

                    translated = `${to_be} ${nextWord}`;
                    i++;
         
              }

              
             

              else {
                nextWord = dictionary.verbs[nextWord];
                  translated = `${to_be} ${nextWord}`;
                  i++;
         
              }

            

          }

       
          // tyeke si mo ki vin apre "to_be" a se yon adjectif 
           else if(isAdjective(nextWord)) {
              translated = `${dictionary.adjectives[nextWord]}`;
              i++;
         
            
          }

        
         
          // s'il pa youn nan kondisyon anwo yo. "to_be" a egal ak "se" 
          else {
            to_be = "se";
              let pos_pronoun = dictionary.pos_pronouns[nextWord];
              if(pos_pronoun){
                translated = `${to_be} ${pos_pronoun}`;
              }else{
                translated = `${to_be} ${nextWord}`;
              }
              
              i++;
         
          }


    }

    else if(negation && dictionary.pos_pronouns[nextWord]){
      translated = `${negation}`;
    }


    // nagations and nextword 
    else if(negation && nextWord) {
     
         if(genNimewo(nextWord)){

       

          if(word === "ain't" || word === "aren't" || word === "isn't"){
            negation = "pa genyen"
          }else if(word === "wasn't" || word === "weren't" ) {
            negation = "pat genyen"
          }

           
            translated = `${negation} ${nextWord}`;
            i++;
          }
     
           
     
        else if(nextWord.endsWith('ing')){
           nextWord = nextWord.slice(0, -3);

              if(word === "ain't" || word === "aren't" || word === "isn't"){
                  negation = "pap"
                }else if(word === "wasn't" || word === "weren't" ) {
                  negation = "pat"
                }

           
        

                const last_consonant = nextWord[nextWord.length - 1];
                const sec_bef_last_consonant = nextWord[nextWord.length - 2];

             if(last_consonant === sec_bef_last_consonant ){
               
                 nextWord = dictionary.verbs[nextWord.slice(0, -1)];
                //  nextWord = dictionary.verbs[nextWord];
                   translated = `${negation} ${nextWord}`;
                   i++;
         
              }

              else if(consonants.includes(last_consonant) && consonants.includes(sec_bef_last_consonant) ){
                
                //  nextWord = dictionary.verbs[nextWord.slice(0, -1)];
                 nextWord = dictionary.verbs[nextWord];
                   translated = `${negation} ${nextWord}`;
                   i++;
         
              }



              else if(consonants.includes(nextWord[nextWord.length - 1]) && vowels.includes(nextWord[nextWord.length - 2])){
                     let add_e = nextWord + "e";
                     let verb = Object.keys(dictionary.verbs);
                     if(verb.includes(add_e)){
                        nextWord = dictionary.verbs[add_e];
                     }else {
                       nextWord = add_e.slice(0, -1);
                       nextWord = dictionary.verbs[nextWord];
                     }
             
                     translated = `${negation} ${nextWord}`;
                     i++;
              }
              
              // lew retire "ing" si se "y" ki denye lèt la
              else if(nextWord.endsWith("y")){
                  if(isOneSyllable(nextWord)){
                    let add_ie = nextWord.slice(0, -1) + "ie";
                     nextWord = dictionary.verbs[add_ie];
                  }else{
                    nextWord = dictionary.verbs[nextWord]
                  }

                    translated = `${negation} ${nextWord}`;
                    i++;
         
              }

              
             

              else {
                nextWord = dictionary.verbs[nextWord];
                  translated = `${negation} ${nextWord}`;
                  i++;
         
              }

            

          }

   

       
          // tyeke si mo ki vin apre "to_be" a se yon adjectif 
           else if(isAdjective(nextWord)) {

             if(word === "ain't" || word === "aren't" || word === "isn't"){
                  negation = "pa"
                }else if(word === "wasn't" || word === "weren't" ) {
                  negation = "pat"
                }


              translated = `${negation} ${dictionary.adjectives[nextWord]}`;
              i++;
         
            
          }

          else if(dictionary.verbs[nextWord]){
              translated = `${negation} ${dictionary.verbs[nextWord]}`
              i++;
          }

          else {
               if(word === "ain't" || word === "aren't" || word === "isn't"){
                  negation = "pa"
                }else if(word === "wasn't" || word === "weren't" ) {
                  negation = "pat"
                }
              if(dictionary.pronouns[nextWord]){
                nextWord = dictionary.pronouns[nextWord]
              }else{
                nextWord = nextWord
              }

              translated = `${negation} ${nextWord}`;
              i++;
         
          }

    }
     
      
    

   
    // pronoun and modal 
    else if(pronoun && dictionary.modal_verbs[nextWord]){
          console.log(dictionary.modal_verbs[nextWord])
        translated = `${pronoun} ${dictionary.modal_verbs[nextWord]}`;
        i++
    }

   
   
   
    else if(indef_article && nextWord){
      let noun_next_word = dictionary.nouns[nextWord]
      if(noun_next_word){
        nextWord = dictionary.nouns[nextWord];
      }else {
        nextWord = dictionary.adjectives[nextWord];
      }
     
     translated = `${indef_article} ${nextWord}`;
     i++;
    }

    else if(adjective && nextWord){
      nextWord = dictionary.nouns[nextWord];
      if(nextWord){
        translated = `${adjective} ${nextWord}`;
        i++;
      }
       
    }

    // itilizasyon de "do" tankou "eske" oubyen "fè" 
    else if(words[0] === "do" || words[0] === "does"){
      words[0] = "eske"

      let pronoun = dictionary.pronouns[nextWord];
      if(pronoun){
        translated = `eske ${pronoun}`;
      }else {
        translated = `eske ${nextWord}`;
      }
      
      i++;
    }

     else if(words[0] === "did"){
      words[0] = "eske"

      let pronoun = dictionary.pronouns[nextWord];
      if(pronoun){
        translated = `eske ${pronoun} te`;
      }else {
        translated = `eske ${nextWord} te`;
      }
      
      i++;
    }

  
         // pronon tankou "my" "your"
    else if(pos_pronoun && nextWord) {
    
        nextWord = dictionary.nouns[nextWord];
        translated = `${nextWord} ${pos_pronoun}`;
        i++;
     
    }

   


 


   
    // sil pa jwenn tradiksyon, lap fel mo pa mo 
    else {
      translated = expression || noun || pronoun || verb || article || indef_article || def_article || preposition ||
                    conjunction || interrogative || modal_verb || adjective || adverb || pos_pronoun ||
                    to_be ||number || negation || word
  
    }

    // si mo a pa jwenn okenn tradiksyon
  
 
    // pouse chak mo yo youn pa youn nan array a 
    result.push(translated);

 

    // kole chak mo yo ansanm pou kreye fraz la
    let final_translation = result.join(" ");
   
   
    // si final la gen undefined → pa montre tradiksyon an
    if (final_translation.includes("undefined")) {
     
        setAlert("Sorry, We can't translate that yet. Why not click the menu button in the top left corner to see a list of predefined expressions ready to translate in Creole? with audio. Amazing, right?");
        setCombined_word("");
        setTranslation(""); 
      return;
    }else {
         setCombined_word(final_translation);
         setTranslation("");   
         setAlert("");
    }
 
  
   
    
        
      }

      
    }
      
  
  }

  // fen premye kondisyon an
  const handleErase = () => {

    
     setTimeout(() => {
          setInput("");
          setTranslation("")
          setCombined_word("");
          setAlert("");
     },500)
    
  }

   
 // remove empty spaces and add underscores in place of between words
  const toUnderscore = (str) => {
  return str
    .trim()
    .replace(/[^\w\s]/g, "")   // remove punctuation (anything not letter/number/underscore/space)
    .replace(/\s+/g, "_");     // replace spaces with underscores
};


 // function to remove accents and special character for storing files in the res/raw
   function cleanText(str) {
  return str
    .normalize("NFD")                 // separe aksan yo
    .replace(/[\u0300-\u036f]/g, "") // retire aksan yo
    .replace(/[^a-zA-Z0-9 ]/g, "");  // retire karaktè espesyal yo
}
  // word with accent removed
  const translated_accent_removed = cleanText(translation);



  let audioFile = `${toUnderscore(translated_accent_removed)}.mp3`;

  // retrieving audio from digital ocean url 
   const playSound = async () => {
    // Si w ap pran URL yo soti nan JSON / API
    const url = `https://app-files.nyc3.digitaloceanspaces.com/audio-voices/${audioFile}`;

    const sound = new Sound(url, null, (error) => {
      if (error) {
        console.log("❌ Sound load error", error);
        return;
      }
      sound.play((success) => {
        if (success) console.log("✅ Sound finished playing");
        else console.log("❌ Playback failed");
        sound.release();
      });
    });
  };


   // BuyMeACoffee Handler
  const donateBMAC = () => {
    const url = "https://buymeacoffee.com/jsterling1980";
    Linking.openURL(url);
  };

   const price = ["1", "5", "10", "20"];

  const handlePress = (amount) => {
    // console.log(`You pressed $${amount}`);
    Linking.openURL(`https://www.paypal.com/paypalme/jsterling1980/${amount}`);
    // Ou ka ajoute fonksyon ou isit la, eg. ouvri Stripe, Paypal, elatriye
  };

  const handlePlayBtn = () => {
      playSound();
      // playAudio();
      // console.log(audioFile)
  }

  // const toPaypalDonate = () => {
  //     Linking.openURL('https://www.paypal.com/paypalme/jsterling1980');
  // }

   const currentYear = new Date().getFullYear();

 

const saveInputToHistory = async (text) => {
  try {
    const entry = {
      text: text,
      date: formatDate()
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    await AsyncStorage.setItem("translation_history", JSON.stringify(newHistory));
  } catch (e) {
    console.log("Error saving history", e);
  }
};



   return (
    
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
         <TouchableOpacity style={{position:"absolute",left:20, top:20, zIndex:1}} onPress={() => setSugContainer(false)}>
             <Text><FontAwesome name="bars" size={30} color="white" /></Text>
         </TouchableOpacity>
           
       <View style={[
                  styles.sug_container,
                  sugContainer && { display: "none" },
                  !sugContainer && { display: "flex" }
                ]}>

              <Text style={{color:"red", fontSize:20, marginTop:20, marginLeft:10}}>
                Suggestions just for you
              </Text>
              <TouchableOpacity style={styles.close_modal} onPress={() => setSugContainer(true)}>
                 <Text style={{fontSize:30, color:"white",}}>X</Text>
              </TouchableOpacity>

              <FlatList
                data={expressionList}
                keyExtractor={(item) => item}
                style={{ marginTop: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 12,
                      backgroundColor: "#f2f2f2",
                      marginVertical: 5,
                      marginHorizontal: 10,
                      borderRadius: 8
                    }}
                    onPress={() => handleSuggestionPress(item)}
                  >
                    <Text style={{textTransform: 'capitalize', fontSize: 16, color: "black" }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />

           
      </View>

        
          <View style={styles.imageContainer}>
           
                  <Image style={styles.app_logo} source={require('./assets/logo.png')}  resizeMode="contain" />
            
              
          </View>

 


          <View style={styles.banner}>
              <Text style={{color: "white"}}>Ready to Translate</Text>
              <Text style={styles.entokr}>English ➝ Kreyòl</Text>
              <Text style={{color: "white"}}>The easiest way? with sound?</Text>
          </View>
       
         <TextInput
                    style={styles.input}
                    placeholder="Type here or click on the menu to learn Creole faster"
                    value={input}
                    onChangeText={setInput}
         />

         

          <View style={styles.buttons}>
              <TouchableOpacity style={styles.translateBtn} onPress={handleTranslate}>
                <Text style={styles.buttonText}>Translate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearBtn} onPress={handleErase}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
          </View>

          

         {translation && (
               <View style={styles.resultBox}>
                      <View style={styles.translatedArea}>
                          <Text style={styles.resultText}> {translation}</Text>
                          <TouchableOpacity style={styles.playButton} onPress={handlePlayBtn}>
                            <Text style={styles.playText}>🔊</Text>
                          </TouchableOpacity>
                      </View>
                    
                      <View style={styles.info_tips}>
                         <Text style={{color: "red"}}>Tips:</Text>
                         <Text style={styles.infoText}>If a speaker icon is shown, audio is available.</Text>
                      </View>
                </View>
         )} 


         {combined_word && (
               <View style={styles.resultBox}>
                      <View style={styles.translatedArea}>
                          <Text style={styles.resultText}> {combined_word}</Text>
                         
                      </View>
                      <View style={styles.info_tips}>
                         <Text style={{color: "red"}}>Tips:</Text>
                         <Text style={styles.infoText}>If a speaker icon is shown, audio is available.</Text>
                      </View>
                     
                    
                      
                </View>
         )}

        

         {alert && (
               <View style={styles.resultBox}>
                      <View style={styles.translatedArea}>
                          <Text style={{fontSize : 16, color:"black"}}> {alert}</Text>
                         
                         
                      </View>

                     
                </View>
         )} 
    
        
          

          <View style={styles.banner}>
             
              <Text style={styles.entokr_2}>Remember. The app can make mistakes!</Text>
              <Text style={styles.entokr_3}>help us make it better.</Text>
              
          </View>

            {/* Buy Me A Coffee */}
       

        
       

          <View style={styles.paypalBtnContainer}>

         


              {/* <Text>We can make the App better!</Text> */}
              <Text style={styles.paypalButtonText}>Donate with Paypal</Text>
              <View style={styles.buttonContainer}>
                  {price.map((amount, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.button}
                      onPress={() => handlePress(amount)}
                    >
                      <Text style={styles.buttonText}>${amount}</Text>
                    </TouchableOpacity>
                    ))}
              </View>

          <TouchableOpacity
                    onPress={donateBMAC}
                    style={{marginTop:15, marginBottom:15, backgroundColor:"#dfcbae", paddingVertical:5,
                    paddingHorizontal:10, borderRadius:10}}
                    
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#222"
                      }}
                    >
                    Buy Me a Coffee ☕
                    </Text>
          </TouchableOpacity>

              <Text style={styles.Text}>
                  © {currentYear}.DevJS E2C-Translator. All rights reserved.
              </Text>
          </View>

          
    </View>
    </GestureHandlerRootView>
  );

  
}

export default App;

const styles = StyleSheet.create({
  container: {
    position:"relative",
    backgroundColor: "black",
    flex: 1,
  },
  imageContainer:{justifyContent:"center", alignItems: "center"},
  app_logo:{width:200, height:200},

  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingLeft: 10, marginBottom: 10, 
       marginLeft: 5, marginRight: 5, marginTop: 15,backgroundColor: 'white'},

  buttons: { flexDirection: 'row', justifyContent:'space-between', marginBottom: 10 , padding: 10},
  translateBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, flex: 1, marginRight: 5, justifyContent:"center", alignItems:"center" },
  clearBtn: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 8, flex: 1, marginLeft: 5, justifyContent:"center", alignItems:"center" },
  buttonText: { color: '#fff', TextAlign: 'center', fontWeight: 'bold' },

  banner: {flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap:4},
  entokr: {fontSize:20, color: 'red'},
  entokr_2: {fontSize:13, color: 'red'},
  entokr_3: {color: "white"},

  resultBox: { flexDirection: 'column', marginTop: 5, padding:20, gap:20,
    backgroundColor: 'orange', marginRight:5, marginLeft:5, borderRadius: 8, marginBottom: 10},

  // scale_box :{transform: [{ scale: 1.5 }]},

  translatedArea: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},

  resultText: { fontSize: 20, fontWeight: '600', flex: 1, color:'black' },
  playButton: { marginLeft: 10, padding: 5 },
  playText: { fontSize: 24 },
  // suggestion: { padding: 8, backgroundColor: '#f2f2f2', marginVertical: 2, borderRadius: 5, marginRight:5, marginLeft:5, },

  // paypal 
  paypalBtnContainer: {flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20},
  paypalButton: {backgroundColor: 'orange', padding:10, paddingLeft: 40, paddingRight:40, borderRadius:10, marginTop:10, marginBottom: 10},
  paypalButtonText: {fontSize: 16, fontWeight: 'bold', color: 'white'},

  info_tips:{
    flexDirection:"row", gap:4, paddingRight:20
  },
  infoText:{color:'white', TextAlign:'center'},
  tips: {backgroundColor: 'black',marginRight:5, marginLeft:5, padding:20},
  not_found_Text: {TextAlign : 'center', fontSize: 20},

  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex',
  },

  button: {
    justifyContent:"center",
    alignItems:"center",
    // backgroundColor: '#007AFF',
    backgroundColor: 'orange',
    width:50,
    height:25,
    // paddingVertical: 12,
    // paddingHorizontal: 15,
    borderRadius:10,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  Text:{color: "white"},

  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain"
  },

  // suggestion container 
  sug_container : {
   
    width:"96%", 
    height:"70%",
    position:"absolute",
    backgroundColor: "white",
    top:"25%",
    borderRadius:15,
    left:"2%",
    zIndex:100,
   
  },

  close_modal : {
    position:"absolute",
    left:"80%", top:12,
    backgroundColor:"black",
    width:50, height:50,
    borderRadius:50,
    alignItems:"center",
    justifyContent:"center"
  }
});


