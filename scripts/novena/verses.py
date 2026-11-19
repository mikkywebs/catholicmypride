import json, glob, os, re
D='/tmp/data/dra/douayrheims-json'
B={}
for f in glob.glob(D+'/[ON]T-*.json'):
    B[re.sub(r'^[ON]T-\d+_','',os.path.basename(f))[:-5]]={c:v for c,v in json.load(open(f)).items() if c!='charset'}
def get(book,c,a,b=None):
    vs=[B[book][str(c)][str(v)] for v in range(a,(b or a)+1)]
    return ' '.join(x.strip() for x in vs)
REFS=[('Romans','Romans',13,11,12),('Matthew','Matthew',4,18,20),('Luke','Luke',1,45),('Colossians','Colossians',3,12,14),('Isaiah','Isaias',53,4,5),('Matthew','Matthew',6,31,33),('Mark','Mark',10,14),('Ephesians','Ephesians',4,31,32),('Luke','Luke',4,18,19),('Luke','Luke',1,28),('Isaiah','Isaias',40,31),('1-Corinthians','1 Corinthians',10,13),('John','John',14,27),('Revelation','Apocalypse',12,1),('Luke','Luke',15,20),('Isaiah','Isaias',49,15),('2-Corinthians','2 Corinthians',12,9),('Matthew','Matthew',9,37,38),('Luke','Luke',1,50),('Luke','Luke',1,13),('Luke','Luke',2,7),('Isaiah','Isaias',40,3),('Luke','Luke',1,37),('Luke','Luke',1,46,49),('Luke','Luke',1,38),('Isaiah','Isaias',9,6)]
if __name__=='__main__':
    print(sorted(B)[:80])
    for r in REFS:
        try: print(r[1],r[2],':',r[3],'-',r[4] if len(r)>4 else '', '|', get(r[0],*r[2:]))
        except Exception as e: print('ERR',r,e)
