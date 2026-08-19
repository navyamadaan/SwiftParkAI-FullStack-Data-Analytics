import random
import time
import requests


# create a class for spots so that it can hold values
class Spot:
    def __init__(self, ID, Occupied):
        self.ID = ID
        self.Occupied = Occupied

#  a loop to generate all the spots for once and set all occupancy to true for once
all_spots = []
for i in range(1,31):
    individualSpot = Spot(i,True)
    all_spots.append(individualSpot)



# the loop that runs forever and keep changing the data

while True:
    spot = random.choice(all_spots)
    spot.Occupied = random.choice([True,False])

    # create the data for json payload
    data = {"spotId": spot.ID, "occupied": spot.Occupied}

    # push to mongoDB via your API
    try:
        response = requests.post('http://localhost:9000/', json=data)
        print(f"✅ Spot {spot.ID} is now {'Occupied' if spot.Occupied else 'Empty'} | Server: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

    # wait so we dont spam the DB
    time.sleep(5)

