import logging
import time
from app.models.monitoringevent import Monitoring
from app.crud.crud_monitoringevent import monitoring
from fastapi import HTTPException
from sqlalchemy.orm import Session

def check_expiration_time(expire_time):
    year = int(expire_time[0:4])
    month = int(expire_time[5:7])
    day = int(expire_time[8:10])
    hour = int(expire_time[11:13])
    minute = int(expire_time[14:16])
    sec = int(expire_time[17:19])

    time_now = time.localtime()
    print(time.asctime(time_now))
    
    if year>=time_now[0] and month>=time_now[1]: 
        # print(year, time_now[0])
        # print(month, time_now[1])
        if(day>time_now[2]):
            # print(day, time_now[2])
            return True
        elif(day==time_now[2]):
            # print("Day == day now", day, time_now[2])
            if(hour>time_now[3]+3):     #+3 is for timeZone (GMT+3)
                # print(hour, time_now[3])
                return True
            elif(hour==time_now[3]+3):
                # print("Time == time now", hour, time_now[3])
                if(minute>time_now[4]):
                    # print(minute, time_now[4])
                    return True
                elif(minute==time_now[4]):
                    # print("Minute == minute now", minute, time_now[4])
                    if(sec>=time_now[5]):
                        # print(sec, time_now[5])
                        return True
                else:
                    return False
            else:
                return False
        else:
            return False
    else:
        return False

def check_numberOfReports(db: Session, item_in: Monitoring)-> Monitoring:
    if item_in.maximumNumberOfReports>1:
        item_in.maximumNumberOfReports -= 1
        db.add(item_in)
        db.commit()
        db.refresh(item_in)
        return item_in
    elif item_in.maximumNumberOfReports==1:
        item_in.maximumNumberOfReports -= 1
        monitoring.remove(db=db, id=item_in.id)
        return item_in
    else:
        logging.warning("Subscription has expired (maximum number of reports")