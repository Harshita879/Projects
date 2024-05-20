import pywhatkit
import time
   
while True:
    time.sleep(86400) #86400 seconds in a day
 
pywhatkit.sendwhatmsg("Contact Number", 
                      "HELLO", 
                      9, 45)