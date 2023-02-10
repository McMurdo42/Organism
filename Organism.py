import time
from random import *
from math import *

screensize_x = 10000
screensize_y = 10000
canvasWidth = 10000
canvasHeight = 10000

initialOrganisms = 100


sick = 1
sickness = 1
OrganismList = []
Living_Organism = []

color = '#%02x%02x%02x' % (128, 128, 128)

alive_organisms = 0
bob = 0
for fun in range(0,initialOrganisms):
   startX = randint(0,canvasWidth)
   startY = randint(0,canvasHeight)
   x = startX
   y = startY
   buddy = []
   tribal = randint(0,255)
   br = randint(0,255)
   moveyness = randint(0,255)
   # ID                  0
   buddy.append(bob)
   # Age                 1
   buddy.append(0)
   # Health              2
   buddy.append(int(100))
   # x coordinites       3
   buddy.append(x)
   # y coordinites       4
   buddy.append(y)
   # Tribalism           5
   buddy.append(tribal)
   # Birth rate          6
   buddy.append(br)
   # Moveability         7
   buddy.append(moveyness)
   # Kid??               8
   buddy.append(False)
   # Next Kid            9
   buddy.append(510 - br)
   # birth place X       10
   buddy.append(startX)
   # birth place Y       11
   buddy.append(startY)
   # Time since birth    12
   buddy.append(0)
   # Alive??             13
   buddy.append(True)
   # TkinterID           14
   buddy.append(bob+1)
   print(buddy)
   OrganismList.append(buddy)
   Living_Organism.append(buddy)
   bob = bob + 1
   alive_organisms = alive_organisms + 1
currentOrganism = 0





def mutate_ammount():
   amount = 100
   change = 0
   while amount != 0:
       change = change + randint(0,100)
       amount = amount - 1
   change = change / 10000
   change = change - 0.5
   change = change * 2
   return change
def mutate_number(change, number):
   if change < 0:
       number = (number * change) + number
   else:
       number = (255 - number) * change + number
   number = round(number)
   return number
def Generation(currentOrganism):
   global number
   attributes = []
   for column in range(0,3):
       change = mutate_ammount()
       number = Living_Organism[currentOrganism][column + 5]
       number = mutate_number(change, number)
       attributes.append(number)
   return attributes


def moveOrganism(currentOrganism):
   coordinate = [Living_Organism[currentOrganism][3],Living_Organism[currentOrganism][4]]
   travel = Living_Organism[currentOrganism][7]
   moveX = (randint(0, travel) - (travel * 0.5)) / 10
   moveY = (randint(0, travel) - (travel * 0.5)) / 10
   moveX = round(moveX)
   moveY = round(moveY)
   if moveX > 0 and coordinate[0] > (canvasWidth - 10):
       moveX = 0
   if moveX < 0 and coordinate[0] < 10:
       moveX = 0
   if moveY > 0 and coordinate[1] > (canvasHeight - 10):
       moveY = 0
   if moveY < 0 and coordinate[1] < 10:
       moveY = 0
   Living_Organism[currentOrganism][3]+=moveX
   Living_Organism[currentOrganism][4]+=moveY
   time.sleep(0)
def birth(currentOrganism):
   global bob, OrganismList, alive_organisms, Living_Organism
   if Living_Organism[currentOrganism][9] == Living_Organism[currentOrganism][1]:
       attributes = Generation(currentOrganism)
       coordinate = [Living_Organism[currentOrganism][3],Living_Organism[currentOrganism][4]]
       buddy = []
       tribal = attributes[0]
       br = attributes[1]
       moveyness = attributes[2]
       # ID                  0
       buddy.append(bob)
       # Age                 1
       buddy.append(0)
       # Health              2
       buddy.append(int(100))
       # x coordinites       3
       buddy.append(coordinate[0])
       # y coordinites       4
       buddy.append(coordinate[1])
       # Tribalism           5
       buddy.append(tribal)
       # Birth rate          6
       buddy.append(br)
       # Moveability         7
       buddy.append(moveyness)
       # Kid??               8
       buddy.append(True)
       # Next Kid            9
       buddy.append(510 - br)
       # birth place X       10
       buddy.append(coordinate[0])
       # birth place Y       11
       buddy.append(coordinate[1])
       # Time since birth    12
       buddy.append(0)
       # Alive??             13
       buddy.append(True)
       # TkinterID           14
       buddy.append(bob+1)
       OrganismList.append(buddy)
       Living_Organism.append(buddy)
       alive_organisms = alive_organisms + 1
       bob = bob + 1
       Living_Organism[currentOrganism][9] = (510 - Living_Organism[currentOrganism][6]) + Living_Organism[currentOrganism][1]
       Living_Organism[currentOrganism][8] = True
   if Living_Organism[currentOrganism][8] == True:
       if Living_Organism[currentOrganism][12] != 20:
           Living_Organism[currentOrganism][12] = Living_Organism[currentOrganism][12] + 1
       else:
           Living_Organism[currentOrganism][12] = 0
           Living_Organism[currentOrganism][8] = False



def DEATH(currentOrganism,canvasWidth,canvasHeight,alive_organisms):
   global sickness, sick
   popdensityeffect = (-0.5 * (((2 ** (0.01 * (alive_organisms - 3000))) - 1) / ((2 ** (0.01 * (alive_organisms - 3000))) + 1))) + 0.5
   if (Living_Organism[currentOrganism][5] + Living_Organism[currentOrganism][6] + Living_Organism[currentOrganism][7]) > 0:
       lifechance = round(1500 * popdensityeffect * (275 / (Living_Organism[currentOrganism][5] + Living_Organism[currentOrganism][6] + Living_Organism[currentOrganism][7])))
   else:
        lifechance = 750
   dead = randint(0,lifechance)
   sick = 1
   if dead == 0:
       Living_Organism[currentOrganism][13] = False
   if Living_Organism[currentOrganism][3] < 11 or Living_Organism[currentOrganism][3] > canvasWidth - 9 or Living_Organism[currentOrganism][4] < 11 or Living_Organism[currentOrganism][4] > canvasHeight - 9:
       Living_Organism[currentOrganism][13] = False

def Disease(severity,mortality,Contagious):
    global Living_Organism
    Casualties = 0
    infected = []
    TheDoomed = []
    while severity != 0:
        TheDoomed = randint(0,alive_organisms - 1)
        infected.append(Living_Organism[TheDoomed])
        severity = severity - 1
    for item in enumerate(infected):
        density = 0
        Neighbors = []
        for organism, rowList in enumerate(Living_Organism):
            if (Living_Organism[organism][3] - Living_Organism[currentOrganism][3]) * (Living_Organism[organism][3] - Living_Organism[currentOrganism][3]) + (Living_Organism[organism][4] - Living_Organism[currentOrganism][4]) * (Living_Organism[organism][4] - Living_Organism[currentOrganism][4]) <= Contagious:
                Neighbors.append(organism)
                density = density + 1
        for WillIDie, rowList in enumerate(Neighbors):
            Living_Organism[Neighbors[WillIDie]][2] = Living_Organism[Neighbors[WillIDie]][2] - mortality
            if Living_Organism[Neighbors[WillIDie]][2] <= 0:
                Living_Organism[Neighbors[WillIDie]][13] = False
                Casualties = Casualties + 1
    print('to bad')
    return Casualties


filename = ("data.txt")
File1 = open(filename,'w')

cycle = 0
cycleNumber = int(input('How many cycles do you want between updates: '))
cycles = 0
filename = ''
while 1 == 1:
    sickness = randint(0,1000)
   
    if sickness == 0:
       mortality = randint(1,10) * randint(1,10)
       severity = randint(1,5)
       Contagious = (randint(1,20) * randint(1,20)) ** 2
       Casualties = Disease(severity,mortality,Contagious)
    for rowNumber in range(0,alive_organisms):
       currentOrganism = rowNumber
       if Living_Organism[currentOrganism][13] == True:
           birth(currentOrganism)
           if Living_Organism[currentOrganism][8] == False:
               moveOrganism(currentOrganism)
           Living_Organism[currentOrganism][1] = Living_Organism[currentOrganism][1] + 1
           DEATH(currentOrganism,canvasWidth,canvasHeight,alive_organisms)
    if cycle == cycleNumber:
        print(cycles,' : ',alive_organisms)
        cycle = 0
        SendList = []
        File1.seek(0)
        for rowNumber in range(0,alive_organisms):
            if Living_Organism[rowNumber][13] == True:
                File1.write(str(Living_Organism[rowNumber][3]))
                File1.write(str(','))
                File1.write(str(Living_Organism[rowNumber][4]))
                File1.write(str(','))
                File1.write(str(Living_Organism[rowNumber][5]))
                File1.write(str(','))
                File1.write(str(Living_Organism[rowNumber][6]))
                File1.write(str(','))
                File1.write(str(Living_Organism[rowNumber][7]))
                File1.write('\n')
        File1.truncate()
    cycle += 1
    cycles+=1
    currentOrganism = alive_organisms - 1
    while currentOrganism != -1:
       if Living_Organism[currentOrganism][13] == False:
           Living_Organism[currentOrganism] = Living_Organism[alive_organisms - 1]
           Living_Organism.pop()
           alive_organisms = alive_organisms - 1
       currentOrganism = currentOrganism - 1
    time.sleep(0)
    sick = 1
print('________________________________________________')
for row in OrganismList:
   print(row)

