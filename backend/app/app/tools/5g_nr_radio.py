import math

channel_bw = input("Enter the 5G Channel Bandwidth (MHz): ")
scs = input("Enter the Subcarrier Spacing (KHz): ")
mimo_layers = input("Enter the number of MIMO layers: ")

class prbs:
    def __init__(self, channel_bw, scs) -> None:
        self.channel_bw = channel_bw
        self.scs = scs


    