import speech_recognition as sr
import pywhatkit
import pyttsx3

#pywhatkit.sendwhatmsg('+971568507809', 'Happy Birthday', 00, 31, 42)
speaker = pyttsx3.init()
voices = speaker.getProperty('voices')
speaker.setProperty('voice', voices[1].id)
speaker.say('Hello, how may I help you?')
speaker.runAndWait()

listener = sr.Recognizer()

def getSpeech():
    try:
        with sr.Microphone() as source:
            listener.adjust_for_ambient_noise(source, duration=0.2)
            print('Listening.....')
            voice = listener.listen(source)
            comand = listener.recognize_google(voice)
            command = command.lower()
            print (command)
            
    except:
        print('No Command')
        return None
    return command 

l = ['Harshita', '+971568507809']

def getNum(l, command):
    counter = 0
    for i in l:
        if i == command:
            numIndex = counter +1
            num =l[numIndex]
            return num
        counter = counter+1
    return None

while True:
    command = getSpeech()
    if command is not None and'send WhatsApp message to' in command:
        name = command.replace('send WhatsApp message to', '')
        name = name.strip()
        number = getNum(1, name)
        speaker.say('What would you like me to say')
        speaker.runAndWait()
        newCommand = getSpeech()
        speaker.say('What time would you like me to send the message')
        speaker.runAndWait()
        sendTime = getSpeech()
        if ':' in sendTime:
            sendTime =sendTime.replace(':', '')
            speaker.say('Message to '+name+ 'has been scheduled')
            speaker.runAndWait()
            hours = sendTime[0:2]
            hours = int(hours)
            minutes =sendTime
            pywhatkit.sendwhatmsg(number, newCommand, hours, minutes)
            
