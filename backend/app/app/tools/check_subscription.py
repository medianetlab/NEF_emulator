import logging
import time
from app.crud import crud_mongo

def check_expiration_time(expire_time):
    year = int(expire_time[0:4])
    month = int(expire_time[5:7])
    day = int(expire_time[8:10])
    hour = int(expire_time[11:13])
    minute = int(expire_time[14:16])
    sec = int(expire_time[17:19])

    time_now = time.localtime()
    # print(time.asctime(time_now))
    
    if year>time_now[0]: 
        # print(year, time_now[0])
        return True
    elif year == time_now[0]:
        if month > time_now[1]:
            # print(month, time_now[1])
            return True
        elif(month == time_now[1]):
            if(day>time_now[2]):
                # print(day, time_now[2])
                return True
            elif(day==time_now[2]):
                # print("Day == day now", day, time_now[2])
                if(hour>time_now[3]):
                    # print(hour, time_now[3])
                    return True
                elif(hour==time_now[3]):
                    # print("Time == time now", hour, time_now[3])
                    if(minute>time_now[4]):
                        print(minute, time_now[4])
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
        else:
            return False
    else:
        return False

def check_numberOfReports(maximum_number_of_reports: int) -> bool:
    if maximum_number_of_reports >= 1:
        return True
    else:
        logging.warning("Subscription has expired (maximum number of reports")
        return False