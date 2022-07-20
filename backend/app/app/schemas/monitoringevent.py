from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, IPvAnyAddress, AnyHttpUrl
from enum import Enum

# Shared properties | used for request body in endpoint/items.py
#We can declare a UserBase model that serves as a base for our other models. And then we can make subclasses of that model that inherit its attributes

class PlmnId(BaseModel):
    mcc: int
    mnc: int

class LocationInfo(BaseModel):
    cellId: Optional[str] = None
    enodeBId: Optional[str] = None
#    routingAreaId: Optional[str] = None
#    trackingAreaId: Optional[str] = None
#    plmnId: Optional[PlmnId] = None
#    twanId: Optional[str] = None

class MonitoringType(str, Enum):
    locationReporting = "LOCATION_REPORTING"
    lossOfConnectivity = "LOSS_OF_CONNECTIVITY"
    ueReachability = "UE_REACHABILITY"
    
class ReachabilityType(str, Enum):
    sms = "SMS"
    data = "DATA"

class MonitoringEventReport(BaseModel):
#    msisdn: Optional[str] = None
    externalId: Optional[str] = Field("123456789@domain.com", description="Globally unique identifier containing a Domain Identifier and a Local Identifier. \<Local Identifier\>@\<Domain Identifier\>")
    monitoringType: MonitoringType
    locationInfo: Optional[LocationInfo] = None
    ipv4Addr: Optional[IPvAnyAddress] = Field(None, description="String identifying an Ipv4 address")
    

class MonitoringEventSubscriptionCreate(BaseModel):
    # mtcProviderId: Optional[str] = Field(None, description="Identifies the MTC Service Provider and/or MTC Application")
    externalId: Optional[str] = Field("123456789@domain.com", description="Globally unique identifier containing a Domain Identifier and a Local Identifier. \<Local Identifier\>@\<Domain Identifier\>")
    # msisdn: Optional[str] = Field("918369110173", description="Mobile Subscriber ISDN number that consists of Country Code, National Destination Code and Subscriber Number.")
    # externalGroupId: Optional[str] = Field("Group1@domain.com", description="Identifies a group made up of one or more subscriptions associated to a group of IMSIs, containing a Domain Identifier and a Local Identifier. \<Local Identifier\>@\<Domain Identifier\>")
    # addExtGroupIds: Optional[str] = None
    #Remember, when you actually trying to access the database through CRUD methods you need to typecast the pydantic types to strings, int etc.
    # ipv4Addr: Optional[IPvAnyAddress] = Field(None, description="String identifying an Ipv4 address")    
    # ipv6Addr: Optional[IPvAnyAddress] = Field("0:0:0:0:0:0:0:1", description="String identifying an Ipv6 address. Default value ::1/128 (loopback)")
    notificationDestination: AnyHttpUrl = Field("http://localhost:80/api/v1/utils/monitoring/callback", description="Reference resource (URL) identifying service consumer's endpoint, in order to receive the asynchronous notification.") #Default value for development testing
    monitoringType: MonitoringType
    maximumNumberOfReports: Optional[int] = Field(None, description="Identifies the maximum number of event reports to be generated. Value 1 makes the Monitoring Request a One-time Request", ge=1)
    monitorExpireTime: Optional[datetime] = Field(None, description="Identifies the absolute time at which the related monitoring event request is considered to expire")
    maximumDetectionTime: Optional[int] = Field(1, description="If monitoringType is \"LOSS_OF_CONNECTIVITY\", this parameter may be included to identify the maximum period of time after which the UE is considered to be unreachable.", gt=0)
    reachabilityType: Optional[ReachabilityType] = Field("DATA", description="If monitoringType is \"UE_REACHABILITY\", this parameter shall be included to identify whether the request is for \"Reachability for SMS\" or \"Reachability for Data\"")

class MonitoringEventSubscription(MonitoringEventSubscriptionCreate):
    link: Optional[AnyHttpUrl] = Field("https://myresource.com", description="String identifying a referenced resource. This is also returned as a location header in 201 Created Response")
    ipv4Addr: Optional[IPvAnyAddress] = Field(None, description="String identifying an Ipv4 address")   
    class Config:
            orm_mode = True

class MonitoringNotification(MonitoringEventReport):
    subscription: AnyHttpUrl
    lossOfConnectReason: Optional[int] = Field(None, description= "According to 3GPP TS 29.522 the lossOfConnectReason attribute shall be set to 6 if the UE is deregistered, 7 if the maximum detection timer expires or 8 if the UE is purged")

class MonitoringEventReportReceived(BaseModel):
    ok: bool