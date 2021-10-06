from typing import List, Optional
from datetime import datetime
from fastapi.param_functions import File
from pydantic import BaseModel, Field, IPvAnyAddress, AnyHttpUrl, constr
from enum import Enum

class Snssai(BaseModel):
    sst: int = Field(None, description="Unsigned integer representing the Slice/Service Type. Value 0 to 127 correspond to the standardized SST range. Value 128 to 255 correspond to the Operator-specific range.", ge=0, le=255)
    sd: Optional[constr(regex=r'^[0-9a-fA-F]{6}$')] = Field(None, description="This value respresents the Slice Differentiator, in hexadecimal representation.")

class UsageThreshold(BaseModel):
    duration: int = Field(None, description="A period of time in units of seconds", ge=0)
    totalVolume: int = Field(None, description="A volume in units of bytes", ge=0)
    downlinkVolume: int = Field(None, description="A volume in units of bytes", ge=0)
    uplinkVolume: int = Field(None, description="A volume in units of bytes", ge=0)

class RequestedQoSMonitoringParameters(str, Enum):
    downlink = "DOWNLINK"
    uplink = "UPLINK"
    round_trip = "ROUND_TRIP"

class ReportingFrequency(str, Enum):
    event_trig = "EVENT_TRIGGERED"
    per = "PERIODIC"
    ses_rel = "SESSION_RELEASE"

class QosMonitoringInformation(BaseModel):
    reqQosMonParams: List[RequestedQoSMonitoringParameters] = Field(None, description="Indicates the requested QoS monitoring parameters to be measured", min_items=1)
    repFreqs: List[ReportingFrequency] = Field(None, description="Indicates the frequency for the reporting", min_items=1)
    latThreshDl: int = Field(None, description="Threshold in units of milliseconds for downlink packet delay", ge=0)
    latThreshUl: int = Field(None, description="Threshold in units of milliseconds for uplink packet delay", ge=0)
    latThreshRp: int = Field(None, description="Threshold in units of milliseconds for round trip packet delay", ge=0)
    waitTime: int = Field(None, description="Indicates the minimum waiting time (seconds) between subsequent reports. Only applicable when the \"repFreqs\" attribute includes \"EVENT_TRIGGERED\".")
    repPeriod: int = Field(None, description="Indicates the time interval (seconds) between successive reporting. Only applicable when the \"repFreqs\" attribute includes\"PERIODIC\".")

class SponsorInfo(BaseModel):
    pass

class AsSessionWithQoSSubscription(BaseModel):
    link: Optional[AnyHttpUrl] = Field("https://myresource.com", description="String identifying a referenced resource. This is also returned as a location header in 201 Created Response")
    #Remember, when you actually trying to access the database through CRUD methods you need to typecast the pydantic types to strings, int etc.
    ipv4Addr: Optional[IPvAnyAddress] = Field(None, description="String identifying an Ipv4 address")    
    ipv6Addr: Optional[IPvAnyAddress] = Field("0:0:0:0:0:0:0:1", description="String identifying an Ipv6 address. Default value ::1/128 (loopback)")
    macAddr: Optional[constr(regex=r'^([0-9a-fA-F]{2})((-[0-9a-fA-F]{2}){5})$')]
    notificationDestination: AnyHttpUrl = "https://example.com/mynetapp"
    snssai: Optional[Snssai] = None
    dnn: Optional[str] = Field("province1.mnc01.mcc202.gprs", description="String identifying the Data Network Name (i.e., Access Point Name in 4G)")    
    qosReference: int = Field(None, description="Identifies a pre-defined QoS Information", ge=1, le=90)
    altQoSReferences: List[int] = Field(None, description="Identifies an ordered list of pre-defined QoS information. The lower the index of the array the higher the priority.", min_items=1)
    usageThreshold: Optional[UsageThreshold] = None
    qosMonInfo: Optional[QosMonitoringInformation] = None
    class Config:
            orm_mode = True
