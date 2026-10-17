from pathlib import Path
import re,json,sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor,white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1]
items=json.loads(re.search(r'const data=(\[.*?\]);const roomItems=',(root/'dist/kitchen.js').read_text())[1])
photos=json.loads((root/'dist/quote-photos/manifest.json').read_text())
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('QuoteSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('QuoteBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
houses={'ground':'Ground floor','first1':'First floor · House 1','first2':'First floor · House 2','second':'Second floor · House'}
rooms={'kitchen':'Kitchen','master':'Bedroom 1','bedroom2':'Bedroom 2','bedroom3':'Bedroom 3','hall':'Hall','pooja':'Pooja room','unassigned':'Wardrobe · bedroom placement pending'}
green=HexColor('#2d503d');ink=HexColor('#263b2e');muted=HexColor('#6b7667');pale=HexColor('#eff3e9')
W,H=A4;c=canvas.Canvas(str(out),pagesize=A4);c.setTitle('Olive Tree Interiors - Mr. Pradap - Perur - Visual Quotation');c.setAuthor('Olive Tree Interiors');pages=[];total_pages=sum((sum(i['house']==h for i in items)+2)//3 for h in houses)+1
page_no=0
def money(n):
 whole,decimal=f'{n:.2f}'.split('.')
 if len(whole)>3:
  tail=whole[-3:];head=whole[:-3];parts=[]
  while head:parts.insert(0,head[-2:]);head=head[:-2]
  whole=','.join(parts+[tail])
 return '₹'+whole+'.'+decimal
def txt(text,x,y,size=9,bold=False,color=ink):
 c.setFillColor(color);c.setFont('QuoteBold' if bold else 'QuoteSans',size);c.drawString(x,y,text)
def para(text,x,y,w,size=8,color=ink,bold=False):
 st=ParagraphStyle('p',fontName='QuoteBold' if bold else 'QuoteSans',fontSize=size,leading=size*1.38,textColor=color)
 p=Paragraph(escape(text),st);_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return y-h

def begin(title):
 global page_no
 page_no+=1;c.setFillColor(green);c.rect(0,H-77,W,77,fill=1,stroke=0)
 txt('Olive Tree Interiors',30,H-33,20,True,white);txt('Mr. Pradap  |  Perur  |  Interior quotation',30,H-56,9,False,white)
 txt(title,30,H-103,12,True);txt('Dimensions in feet  ·  Rates per sq.ft  ·  Original specification',30,H-120,8,False,muted)
 txt('Olive Tree Interiors  |  9003787621',30,23,8,False,muted);txt(f'{page_no} / {total_pages}',520,23,8,False,muted)

totals={}
for house,label in houses.items():
 entries=[i for i in items if i['house']==house];totals[house]=sum(i['area']*i['rate'] for i in entries if i['id']!=7)
 for start in range(0,len(entries),3):
  begin(label+(' · continued' if start else ''))
  for j,i in enumerate(entries[start:start+3]):
   top=H-139-j*211;bottom=top-197
   c.setStrokeColor(HexColor('#cbd5c4'));c.setFillColor(white);c.rect(27,bottom,W-54,197,fill=1,stroke=1)
   c.setFillColor(pale);c.rect(27,top-25,W-54,25,fill=1,stroke=0)
   room='Bedroom 1 · Master bedroom' if i['house']=='ground' and i['room']=='master' else rooms[i['room']]
   txt(room,39,top-16,8,True,green)
   y=para(f"{i['id']}. {i['name']}",39,top-36,306,11,ink,True)-8
   txt(f"{i['size']}  ·  {i['area']:g} sq.ft",39,y,9);y-=17
   txt(money(i['rate'])+' / sq.ft',39,y,9);y-=20
   txt(money(i['area']*i['rate']),39,y,12,True,green);txt('OPTIONAL · EXCLUDED' if i['id']==7 else 'INCLUDED',185,y+1,7,True,muted);y-=12
   y=para(i['spec'],39,y,306,8)-6
   y=para('2 mm edge banding on applicable board edges; factory finishing.',39,y,306,8,muted)
   if y<bottom+5:raise ValueError(f'Text overflow: {i["id"]}')
   image=root/'dist/quote-photos'/photos[str(i['id'])]
   c.drawImage(str(image),355,bottom+28,width=201,height=133,preserveAspectRatio=True,anchor='c',mask='auto')
   txt('AI-generated photo reference',373,bottom+14,6.7,False,muted)
  if start+3>=len(entries):txt(label+' subtotal: '+money(totals[house]),30,53,10,True,green)
  c.showPage()
begin('Quotation summary');y=H-160
for house,label in houses.items():txt(label,35,y,11,True);txt(money(totals[house]),350,y,11,True);y-=43
c.setFillColor(green);c.rect(27,y-35,W-54,61,fill=1,stroke=0);txt('Selected quotation total',40,y+2,11,True,white);txt(money(sum(totals.values())),350,y+2,16,True,white);y-=76
y=para('Optional crockery unit: ₹75,600.00, excluded from the total above. Total including optional crockery: ₹14,91,450.00.',35,y,520,9)-20
y=para('Images are AI-generated realistic design references for the corresponding type of unit. Final sizes, finishes, hardware and internal arrangements follow the written specification and approved design.',35,y,520,9)-20
para('All items include factory finishing and 2 mm edge banding on applicable board edges. This quotation includes pooja CNC shuttering and an internal drawer box in each of the four houses.',35,y,520,9)
c.showPage();c.save();assert sum(totals.values())==1415850;print(str(out))
