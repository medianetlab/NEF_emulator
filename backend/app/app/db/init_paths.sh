#!/bin/bash

PORT=8888

set -a # automatically export all variables
source .env
set +a


TOKEN=$(curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/login/access-token" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "username=${FIRST_SUPERUSER}" \
  --data-urlencode "password=${FIRST_SUPERUSER_PASSWORD}" \
  -d "grant_type=&scope=&client_id=&client_secret=" \
  | jq -r '.access_token')

echo $TOKEN

#==================================================
echo 'Initiallizing Paths for admin...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/frontend/location/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "description": "NCSRD Library",
  "points": [{"latitude":"37.998119","longitude":"23.819444"},{"latitude":"37.998125","longitude":"23.819436"},{"latitude":"37.998132","longitude":"23.819428"},{"latitude":"37.998138","longitude":"23.819420"},{"latitude":"37.998144","longitude":"23.819412"},{"latitude":"37.998151","longitude":"23.819404"},{"latitude":"37.998157","longitude":"23.819396"},{"latitude":"37.998164","longitude":"23.819388"},{"latitude":"37.998170","longitude":"23.819380"},{"latitude":"37.998176","longitude":"23.819372"},{"latitude":"37.998183","longitude":"23.819364"},{"latitude":"37.998189","longitude":"23.819356"},{"latitude":"37.998195","longitude":"23.819348"},{"latitude":"37.998202","longitude":"23.819340"},{"latitude":"37.998208","longitude":"23.819332"},{"latitude":"37.998215","longitude":"23.819324"},{"latitude":"37.998221","longitude":"23.819316"},{"latitude":"37.998227","longitude":"23.819308"},{"latitude":"37.998234","longitude":"23.819300"},{"latitude":"37.998240","longitude":"23.819291"},{"latitude":"37.998247","longitude":"23.819283"},{"latitude":"37.998253","longitude":"23.819275"},{"latitude":"37.998259","longitude":"23.819267"},{"latitude":"37.998266","longitude":"23.819259"},{"latitude":"37.998272","longitude":"23.819251"},{"latitude":"37.998278","longitude":"23.819243"},{"latitude":"37.998285","longitude":"23.819235"},{"latitude":"37.998283","longitude":"23.819222"},{"latitude":"37.998276","longitude":"23.819214"},{"latitude":"37.998269","longitude":"23.819206"},{"latitude":"37.998263","longitude":"23.819198"},{"latitude":"37.998256","longitude":"23.819191"},{"latitude":"37.998250","longitude":"23.819183"},{"latitude":"37.998243","longitude":"23.819175"},{"latitude":"37.998237","longitude":"23.819167"},{"latitude":"37.998230","longitude":"23.819159"},{"latitude":"37.998224","longitude":"23.819151"},{"latitude":"37.998217","longitude":"23.819143"},{"latitude":"37.998211","longitude":"23.819136"},{"latitude":"37.998204","longitude":"23.819128"},{"latitude":"37.998198","longitude":"23.819120"},{"latitude":"37.998191","longitude":"23.819112"},{"latitude":"37.998185","longitude":"23.819104"},{"latitude":"37.998178","longitude":"23.819096"},{"latitude":"37.998171","longitude":"23.819089"},{"latitude":"37.998165","longitude":"23.819081"},{"latitude":"37.998158","longitude":"23.819073"},{"latitude":"37.998152","longitude":"23.819065"},{"latitude":"37.998145","longitude":"23.819057"},{"latitude":"37.998139","longitude":"23.819049"},{"latitude":"37.998132","longitude":"23.819042"},{"latitude":"37.998126","longitude":"23.819034"},{"latitude":"37.998119","longitude":"23.819026"},{"latitude":"37.998113","longitude":"23.819018"},{"latitude":"37.998106","longitude":"23.819010"},{"latitude":"37.998100","longitude":"23.819002"},{"latitude":"37.998093","longitude":"23.818994"},{"latitude":"37.998087","longitude":"23.818987"},{"latitude":"37.998080","longitude":"23.818979"},{"latitude":"37.998073","longitude":"23.818971"},{"latitude":"37.998067","longitude":"23.818963"},{"latitude":"37.998060","longitude":"23.818955"},{"latitude":"37.998054","longitude":"23.818947"},{"latitude":"37.998047","longitude":"23.818940"},{"latitude":"37.998041","longitude":"23.818932"},{"latitude":"37.998034","longitude":"23.818924"},{"latitude":"37.998028","longitude":"23.818916"},{"latitude":"37.998019","longitude":"23.818921"},{"latitude":"37.998012","longitude":"23.818929"},{"latitude":"37.998006","longitude":"23.818937"},{"latitude":"37.998000","longitude":"23.818945"},{"latitude":"37.997994","longitude":"23.818954"},{"latitude":"37.997987","longitude":"23.818962"},{"latitude":"37.997981","longitude":"23.818970"},{"latitude":"37.997975","longitude":"23.818978"},{"latitude":"37.997969","longitude":"23.818986"},{"latitude":"37.997962","longitude":"23.818995"},{"latitude":"37.997956","longitude":"23.819003"},{"latitude":"37.997950","longitude":"23.819011"},{"latitude":"37.997944","longitude":"23.819019"},{"latitude":"37.997937","longitude":"23.819027"},{"latitude":"37.997931","longitude":"23.819036"},{"latitude":"37.997925","longitude":"23.819044"},{"latitude":"37.997919","longitude":"23.819052"},{"latitude":"37.997912","longitude":"23.819060"},{"latitude":"37.997906","longitude":"23.819068"},{"latitude":"37.997900","longitude":"23.819077"},{"latitude":"37.997894","longitude":"23.819085"},{"latitude":"37.997887","longitude":"23.819093"},{"latitude":"37.997881","longitude":"23.819101"},{"latitude":"37.997875","longitude":"23.819109"},{"latitude":"37.997869","longitude":"23.819118"},{"latitude":"37.997862","longitude":"23.819126"},{"latitude":"37.997856","longitude":"23.819134"},{"latitude":"37.997862","longitude":"23.819143"},{"latitude":"37.997868","longitude":"23.819151"},{"latitude":"37.997874","longitude":"23.819159"},{"latitude":"37.997881","longitude":"23.819167"},{"latitude":"37.997887","longitude":"23.819175"},{"latitude":"37.997894","longitude":"23.819183"},{"latitude":"37.997900","longitude":"23.819191"},{"latitude":"37.997906","longitude":"23.819199"},{"latitude":"37.997913","longitude":"23.819207"},{"latitude":"37.997919","longitude":"23.819215"},{"latitude":"37.997926","longitude":"23.819223"},{"latitude":"37.997932","longitude":"23.819231"},{"latitude":"37.997938","longitude":"23.819239"},{"latitude":"37.997945","longitude":"23.819247"},{"latitude":"37.997951","longitude":"23.819255"},{"latitude":"37.997958","longitude":"23.819263"},{"latitude":"37.997964","longitude":"23.819272"},{"latitude":"37.997970","longitude":"23.819280"},{"latitude":"37.997977","longitude":"23.819288"},{"latitude":"37.997983","longitude":"23.819296"},{"latitude":"37.997990","longitude":"23.819304"},{"latitude":"37.997996","longitude":"23.819312"},{"latitude":"37.998002","longitude":"23.819320"},{"latitude":"37.998009","longitude":"23.819328"},{"latitude":"37.998015","longitude":"23.819336"},{"latitude":"37.998022","longitude":"23.819344"},{"latitude":"37.998028","longitude":"23.819352"},{"latitude":"37.998034","longitude":"23.819360"},{"latitude":"37.998041","longitude":"23.819368"},{"latitude":"37.998047","longitude":"23.819376"},{"latitude":"37.998054","longitude":"23.819384"},{"latitude":"37.998060","longitude":"23.819392"},{"latitude":"37.998066","longitude":"23.819400"},{"latitude":"37.998073","longitude":"23.819408"},{"latitude":"37.998079","longitude":"23.819416"},{"latitude":"37.998086","longitude":"23.819424"},{"latitude":"37.998092","longitude":"23.819432"},{"latitude":"37.998098","longitude":"23.819440"}],
  "start_point": {
    "latitude": 37.998119,
    "longitude": 23.819444
  },
  "end_point": {
    "latitude": 37.998098,
    "longitude": 23.819440
  },
  "color": "red"
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/frontend/location/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
   "description": "NCSRD Gate-IIT", 
   "points": [{"latitude":"37.996095","longitude":"23.818562"},{"latitude":"37.996086","longitude":"23.818565"},{"latitude":"37.996078","longitude":"23.818569"},{"latitude":"37.996069","longitude":"23.818572"},{"latitude":"37.996061","longitude":"23.818576"},{"latitude":"37.996052","longitude":"23.818580"},{"latitude":"37.996044","longitude":"23.818583"},{"latitude":"37.996035","longitude":"23.818587"},{"latitude":"37.996027","longitude":"23.818591"},{"latitude":"37.996018","longitude":"23.818594"},{"latitude":"37.996010","longitude":"23.818598"},{"latitude":"37.996001","longitude":"23.818602"},{"latitude":"37.995993","longitude":"23.818605"},{"latitude":"37.995984","longitude":"23.818609"},{"latitude":"37.995976","longitude":"23.818613"},{"latitude":"37.995967","longitude":"23.818616"},{"latitude":"37.995969","longitude":"23.818627"},{"latitude":"37.995973","longitude":"23.818638"},{"latitude":"37.995976","longitude":"23.818649"},{"latitude":"37.995980","longitude":"23.818659"},{"latitude":"37.995983","longitude":"23.818670"},{"latitude":"37.995986","longitude":"23.818680"},{"latitude":"37.995990","longitude":"23.818691"},{"latitude":"37.995993","longitude":"23.818702"},{"latitude":"37.995996","longitude":"23.818712"},{"latitude":"37.996000","longitude":"23.818723"},{"latitude":"37.996003","longitude":"23.818733"},{"latitude":"37.996006","longitude":"23.818744"},{"latitude":"37.996010","longitude":"23.818754"},{"latitude":"37.996013","longitude":"23.818765"},{"latitude":"37.996017","longitude":"23.818776"},{"latitude":"37.996020","longitude":"23.818786"},{"latitude":"37.996023","longitude":"23.818797"},{"latitude":"37.996027","longitude":"23.818807"},{"latitude":"37.996030","longitude":"23.818818"},{"latitude":"37.996033","longitude":"23.818829"},{"latitude":"37.996037","longitude":"23.818839"},{"latitude":"37.996040","longitude":"23.818850"},{"latitude":"37.996044","longitude":"23.818860"},{"latitude":"37.996047","longitude":"23.818871"},{"latitude":"37.996050","longitude":"23.818881"},{"latitude":"37.996054","longitude":"23.818892"},{"latitude":"37.996057","longitude":"23.818903"},{"latitude":"37.996060","longitude":"23.818913"},{"latitude":"37.996064","longitude":"23.818924"},{"latitude":"37.996067","longitude":"23.818934"},{"latitude":"37.996070","longitude":"23.818945"},{"latitude":"37.996074","longitude":"23.818956"},{"latitude":"37.996077","longitude":"23.818966"},{"latitude":"37.996081","longitude":"23.818977"},{"latitude":"37.996084","longitude":"23.818987"},{"latitude":"37.996087","longitude":"23.818998"},{"latitude":"37.996091","longitude":"23.819008"},{"latitude":"37.996094","longitude":"23.819019"},{"latitude":"37.996097","longitude":"23.819030"},{"latitude":"37.996101","longitude":"23.819040"},{"latitude":"37.996104","longitude":"23.819051"},{"latitude":"37.996107","longitude":"23.819061"},{"latitude":"37.996116","longitude":"23.819057"},{"latitude":"37.996124","longitude":"23.819052"},{"latitude":"37.996132","longitude":"23.819047"},{"latitude":"37.996140","longitude":"23.819041"},{"latitude":"37.996148","longitude":"23.819036"},{"latitude":"37.996156","longitude":"23.819031"},{"latitude":"37.996164","longitude":"23.819026"},{"latitude":"37.996172","longitude":"23.819021"},{"latitude":"37.996180","longitude":"23.819016"},{"latitude":"37.996188","longitude":"23.819010"},{"latitude":"37.996196","longitude":"23.819005"},{"latitude":"37.996204","longitude":"23.819000"},{"latitude":"37.996212","longitude":"23.818995"},{"latitude":"37.996220","longitude":"23.818990"},{"latitude":"37.996228","longitude":"23.818985"},{"latitude":"37.996236","longitude":"23.818980"},{"latitude":"37.996244","longitude":"23.818974"},{"latitude":"37.996252","longitude":"23.818969"},{"latitude":"37.996260","longitude":"23.818964"},{"latitude":"37.996268","longitude":"23.818959"},{"latitude":"37.996276","longitude":"23.818954"},{"latitude":"37.996284","longitude":"23.818949"},{"latitude":"37.996292","longitude":"23.818943"},{"latitude":"37.996300","longitude":"23.818938"},{"latitude":"37.996308","longitude":"23.818933"},{"latitude":"37.996316","longitude":"23.818928"},{"latitude":"37.996324","longitude":"23.818923"},{"latitude":"37.996332","longitude":"23.818918"},{"latitude":"37.996340","longitude":"23.818912"},{"latitude":"37.996348","longitude":"23.818907"},{"latitude":"37.996356","longitude":"23.818902"},{"latitude":"37.996364","longitude":"23.818897"},{"latitude":"37.996372","longitude":"23.818892"},{"latitude":"37.996380","longitude":"23.818887"},{"latitude":"37.996388","longitude":"23.818881"},{"latitude":"37.996396","longitude":"23.818876"},{"latitude":"37.996404","longitude":"23.818871"},{"latitude":"37.996413","longitude":"23.818866"},{"latitude":"37.996421","longitude":"23.818861"},{"latitude":"37.996429","longitude":"23.818856"},{"latitude":"37.996437","longitude":"23.818850"},{"latitude":"37.996445","longitude":"23.818845"},{"latitude":"37.996453","longitude":"23.818840"},{"latitude":"37.996461","longitude":"23.818835"},{"latitude":"37.996469","longitude":"23.818830"},{"latitude":"37.996477","longitude":"23.818825"},{"latitude":"37.996485","longitude":"23.818820"},{"latitude":"37.996493","longitude":"23.818814"},{"latitude":"37.996501","longitude":"23.818809"},{"latitude":"37.996509","longitude":"23.818804"},{"latitude":"37.996517","longitude":"23.818799"},{"latitude":"37.996525","longitude":"23.818794"},{"latitude":"37.996533","longitude":"23.818789"},{"latitude":"37.996541","longitude":"23.818783"},{"latitude":"37.996549","longitude":"23.818778"},{"latitude":"37.996557","longitude":"23.818773"},{"latitude":"37.996565","longitude":"23.818768"},{"latitude":"37.996573","longitude":"23.818763"},{"latitude":"37.996581","longitude":"23.818758"},{"latitude":"37.996589","longitude":"23.818752"},{"latitude":"37.996597","longitude":"23.818747"},{"latitude":"37.996605","longitude":"23.818742"},{"latitude":"37.996613","longitude":"23.818737"},{"latitude":"37.996621","longitude":"23.818732"},{"latitude":"37.996629","longitude":"23.818727"},{"latitude":"37.996637","longitude":"23.818721"},{"latitude":"37.996645","longitude":"23.818716"},{"latitude":"37.996653","longitude":"23.818711"},{"latitude":"37.996661","longitude":"23.818706"},{"latitude":"37.996669","longitude":"23.818701"},{"latitude":"37.996677","longitude":"23.818696"},{"latitude":"37.996685","longitude":"23.818690"},{"latitude":"37.996693","longitude":"23.818685"},{"latitude":"37.996701","longitude":"23.818680"},{"latitude":"37.996709","longitude":"23.818675"},{"latitude":"37.996717","longitude":"23.818670"},{"latitude":"37.996725","longitude":"23.818665"},{"latitude":"37.996733","longitude":"23.818660"},{"latitude":"37.996741","longitude":"23.818654"},{"latitude":"37.996749","longitude":"23.818649"},{"latitude":"37.996757","longitude":"23.818644"},{"latitude":"37.996765","longitude":"23.818639"},{"latitude":"37.996773","longitude":"23.818634"},{"latitude":"37.996781","longitude":"23.818629"},{"latitude":"37.996789","longitude":"23.818623"},{"latitude":"37.996798","longitude":"23.818618"},{"latitude":"37.996806","longitude":"23.818613"},{"latitude":"37.996814","longitude":"23.818608"},{"latitude":"37.996822","longitude":"23.818603"},{"latitude":"37.996830","longitude":"23.818598"},{"latitude":"37.996838","longitude":"23.818592"},{"latitude":"37.996846","longitude":"23.818587"},{"latitude":"37.996854","longitude":"23.818582"},{"latitude":"37.996862","longitude":"23.818577"},{"latitude":"37.996870","longitude":"23.818572"},{"latitude":"37.996878","longitude":"23.818567"},{"latitude":"37.996886","longitude":"23.818561"},{"latitude":"37.996894","longitude":"23.818556"},{"latitude":"37.996902","longitude":"23.818551"},{"latitude":"37.996910","longitude":"23.818546"},{"latitude":"37.996918","longitude":"23.818541"},{"latitude":"37.996926","longitude":"23.818536"},{"latitude":"37.996934","longitude":"23.818530"},{"latitude":"37.996942","longitude":"23.818525"},{"latitude":"37.996950","longitude":"23.818520"},{"latitude":"37.996958","longitude":"23.818515"},{"latitude":"37.996966","longitude":"23.818510"},{"latitude":"37.996974","longitude":"23.818505"},{"latitude":"37.996982","longitude":"23.818500"},{"latitude":"37.996990","longitude":"23.818494"},{"latitude":"37.996998","longitude":"23.818489"},{"latitude":"37.997006","longitude":"23.818484"},{"latitude":"37.997014","longitude":"23.818479"},{"latitude":"37.997022","longitude":"23.818474"},{"latitude":"37.997030","longitude":"23.818469"},{"latitude":"37.997038","longitude":"23.818463"},{"latitude":"37.997046","longitude":"23.818458"},{"latitude":"37.997054","longitude":"23.818453"},{"latitude":"37.997062","longitude":"23.818448"},{"latitude":"37.997070","longitude":"23.818443"},{"latitude":"37.997078","longitude":"23.818438"},{"latitude":"37.997086","longitude":"23.818432"},{"latitude":"37.997094","longitude":"23.818427"},{"latitude":"37.997102","longitude":"23.818422"},{"latitude":"37.997110","longitude":"23.818417"},{"latitude":"37.997118","longitude":"23.818412"},{"latitude":"37.997126","longitude":"23.818407"},{"latitude":"37.997134","longitude":"23.818401"},{"latitude":"37.997142","longitude":"23.818396"},{"latitude":"37.997152","longitude":"23.818402"},{"latitude":"37.997159","longitude":"23.818410"},{"latitude":"37.997165","longitude":"23.818418"},{"latitude":"37.997171","longitude":"23.818426"},{"latitude":"37.997178","longitude":"23.818434"},{"latitude":"37.997184","longitude":"23.818442"},{"latitude":"37.997191","longitude":"23.818450"},{"latitude":"37.997197","longitude":"23.818458"},{"latitude":"37.997204","longitude":"23.818466"},{"latitude":"37.997210","longitude":"23.818473"},{"latitude":"37.997217","longitude":"23.818481"},{"latitude":"37.997223","longitude":"23.818489"},{"latitude":"37.997230","longitude":"23.818497"},{"latitude":"37.997236","longitude":"23.818505"},{"latitude":"37.997243","longitude":"23.818513"},{"latitude":"37.997249","longitude":"23.818521"},{"latitude":"37.997256","longitude":"23.818529"},{"latitude":"37.997262","longitude":"23.818537"},{"latitude":"37.997269","longitude":"23.818545"},{"latitude":"37.997275","longitude":"23.818553"},{"latitude":"37.997282","longitude":"23.818561"},{"latitude":"37.997288","longitude":"23.818569"},{"latitude":"37.997294","longitude":"23.818576"},{"latitude":"37.997301","longitude":"23.818584"},{"latitude":"37.997307","longitude":"23.818592"},{"latitude":"37.997314","longitude":"23.818600"},{"latitude":"37.997320","longitude":"23.818608"},{"latitude":"37.997327","longitude":"23.818616"},{"latitude":"37.997333","longitude":"23.818624"},{"latitude":"37.997340","longitude":"23.818632"},{"latitude":"37.997346","longitude":"23.818640"},{"latitude":"37.997353","longitude":"23.818648"},{"latitude":"37.997359","longitude":"23.818656"},{"latitude":"37.997366","longitude":"23.818664"},{"latitude":"37.997372","longitude":"23.818671"},{"latitude":"37.997379","longitude":"23.818679"},{"latitude":"37.997385","longitude":"23.818687"},{"latitude":"37.997392","longitude":"23.818695"},{"latitude":"37.997398","longitude":"23.818703"},{"latitude":"37.997405","longitude":"23.818711"},{"latitude":"37.997411","longitude":"23.818719"},{"latitude":"37.997417","longitude":"23.818727"},{"latitude":"37.997424","longitude":"23.818735"},{"latitude":"37.997430","longitude":"23.818743"},{"latitude":"37.997437","longitude":"23.818751"},{"latitude":"37.997443","longitude":"23.818759"},{"latitude":"37.997450","longitude":"23.818767"},{"latitude":"37.997456","longitude":"23.818774"},{"latitude":"37.997463","longitude":"23.818782"},{"latitude":"37.997469","longitude":"23.818790"},{"latitude":"37.997476","longitude":"23.818798"},{"latitude":"37.997482","longitude":"23.818806"},{"latitude":"37.997489","longitude":"23.818814"},{"latitude":"37.997495","longitude":"23.818822"},{"latitude":"37.997502","longitude":"23.818830"},{"latitude":"37.997508","longitude":"23.818838"},{"latitude":"37.997515","longitude":"23.818846"},{"latitude":"37.997521","longitude":"23.818854"},{"latitude":"37.997528","longitude":"23.818862"},{"latitude":"37.997534","longitude":"23.818870"},{"latitude":"37.997540","longitude":"23.818877"},{"latitude":"37.997547","longitude":"23.818885"},{"latitude":"37.997553","longitude":"23.818893"},{"latitude":"37.997560","longitude":"23.818901"},{"latitude":"37.997566","longitude":"23.818909"},{"latitude":"37.997573","longitude":"23.818917"},{"latitude":"37.997579","longitude":"23.818925"},{"latitude":"37.997586","longitude":"23.818933"},{"latitude":"37.997592","longitude":"23.818941"},{"latitude":"37.997599","longitude":"23.818949"},{"latitude":"37.997605","longitude":"23.818957"},{"latitude":"37.997612","longitude":"23.818965"},{"latitude":"37.997618","longitude":"23.818973"},{"latitude":"37.997625","longitude":"23.818980"},{"latitude":"37.997631","longitude":"23.818988"},{"latitude":"37.997638","longitude":"23.818996"},{"latitude":"37.997644","longitude":"23.819004"},{"latitude":"37.997651","longitude":"23.819012"},{"latitude":"37.997657","longitude":"23.819020"},{"latitude":"37.997663","longitude":"23.819028"},{"latitude":"37.997670","longitude":"23.819036"},{"latitude":"37.997676","longitude":"23.819044"},{"latitude":"37.997683","longitude":"23.819052"},{"latitude":"37.997689","longitude":"23.819060"},{"latitude":"37.997696","longitude":"23.819068"},{"latitude":"37.997702","longitude":"23.819075"},{"latitude":"37.997709","longitude":"23.819083"},{"latitude":"37.997715","longitude":"23.819091"},{"latitude":"37.997722","longitude":"23.819099"},{"latitude":"37.997728","longitude":"23.819107"},{"latitude":"37.997735","longitude":"23.819115"},{"latitude":"37.997741","longitude":"23.819123"},{"latitude":"37.997748","longitude":"23.819131"},{"latitude":"37.997754","longitude":"23.819139"},{"latitude":"37.997761","longitude":"23.819147"},{"latitude":"37.997767","longitude":"23.819155"},{"latitude":"37.997774","longitude":"23.819163"},{"latitude":"37.997780","longitude":"23.819171"},{"latitude":"37.997786","longitude":"23.819178"},{"latitude":"37.997793","longitude":"23.819186"},{"latitude":"37.997799","longitude":"23.819194"},{"latitude":"37.997806","longitude":"23.819202"},{"latitude":"37.997812","longitude":"23.819210"},{"latitude":"37.997819","longitude":"23.819218"},{"latitude":"37.997825","longitude":"23.819226"},{"latitude":"37.997832","longitude":"23.819234"},{"latitude":"37.997838","longitude":"23.819242"},{"latitude":"37.997845","longitude":"23.819250"},{"latitude":"37.997851","longitude":"23.819258"},{"latitude":"37.997858","longitude":"23.819266"},{"latitude":"37.997864","longitude":"23.819274"},{"latitude":"37.997871","longitude":"23.819281"},{"latitude":"37.997877","longitude":"23.819289"},{"latitude":"37.997884","longitude":"23.819297"},{"latitude":"37.997890","longitude":"23.819305"},{"latitude":"37.997897","longitude":"23.819313"},{"latitude":"37.997903","longitude":"23.819321"},{"latitude":"37.997909","longitude":"23.819329"},{"latitude":"37.997916","longitude":"23.819337"},{"latitude":"37.997922","longitude":"23.819345"},{"latitude":"37.997929","longitude":"23.819353"},{"latitude":"37.997935","longitude":"23.819361"},{"latitude":"37.997942","longitude":"23.819369"},{"latitude":"37.997948","longitude":"23.819377"},{"latitude":"37.997955","longitude":"23.819384"},{"latitude":"37.997961","longitude":"23.819392"},{"latitude":"37.997968","longitude":"23.819400"},{"latitude":"37.997974","longitude":"23.819408"},{"latitude":"37.997981","longitude":"23.819416"},{"latitude":"37.997987","longitude":"23.819424"},{"latitude":"37.997994","longitude":"23.819432"},{"latitude":"37.998000","longitude":"23.819440"},{"latitude":"37.998007","longitude":"23.819448"},{"latitude":"37.998013","longitude":"23.819456"},{"latitude":"37.998020","longitude":"23.819464"},{"latitude":"37.998026","longitude":"23.819472"},{"latitude":"37.998032","longitude":"23.819480"},{"latitude":"37.998039","longitude":"23.819487"},{"latitude":"37.998045","longitude":"23.819495"},{"latitude":"37.998052","longitude":"23.819503"},{"latitude":"37.998058","longitude":"23.819511"},{"latitude":"37.998065","longitude":"23.819519"},{"latitude":"37.998071","longitude":"23.819527"},{"latitude":"37.998078","longitude":"23.819535"},{"latitude":"37.998084","longitude":"23.819543"},{"latitude":"37.998091","longitude":"23.819551"},{"latitude":"37.998097","longitude":"23.819559"},{"latitude":"37.998104","longitude":"23.819567"},{"latitude":"37.998110","longitude":"23.819575"},{"latitude":"37.998117","longitude":"23.819582"},{"latitude":"37.998123","longitude":"23.819590"},{"latitude":"37.998130","longitude":"23.819598"},{"latitude":"37.998136","longitude":"23.819606"},{"latitude":"37.998143","longitude":"23.819614"},{"latitude":"37.998149","longitude":"23.819622"},{"latitude":"37.998160","longitude":"23.819629"},{"latitude":"37.998169","longitude":"23.819633"},{"latitude":"37.998177","longitude":"23.819637"},{"latitude":"37.998186","longitude":"23.819641"},{"latitude":"37.998194","longitude":"23.819645"},{"latitude":"37.998202","longitude":"23.819648"},{"latitude":"37.998211","longitude":"23.819652"},{"latitude":"37.998219","longitude":"23.819656"},{"latitude":"37.998228","longitude":"23.819660"},{"latitude":"37.998236","longitude":"23.819664"},{"latitude":"37.998245","longitude":"23.819668"},{"latitude":"37.998253","longitude":"23.819672"},{"latitude":"37.998262","longitude":"23.819675"},{"latitude":"37.998270","longitude":"23.819679"},{"latitude":"37.998279","longitude":"23.819683"},{"latitude":"37.998287","longitude":"23.819687"},{"latitude":"37.998296","longitude":"23.819691"},{"latitude":"37.998304","longitude":"23.819695"},{"latitude":"37.998313","longitude":"23.819699"},{"latitude":"37.998321","longitude":"23.819702"},{"latitude":"37.998329","longitude":"23.819706"},{"latitude":"37.998338","longitude":"23.819710"},{"latitude":"37.998346","longitude":"23.819714"},{"latitude":"37.998355","longitude":"23.819718"},{"latitude":"37.998363","longitude":"23.819722"},{"latitude":"37.998372","longitude":"23.819725"},{"latitude":"37.998380","longitude":"23.819729"},{"latitude":"37.998389","longitude":"23.819733"},{"latitude":"37.998397","longitude":"23.819737"},{"latitude":"37.998410","longitude":"23.819731"},{"latitude":"37.998414","longitude":"23.819721"},{"latitude":"37.998418","longitude":"23.819710"},{"latitude":"37.998422","longitude":"23.819700"},{"latitude":"37.998426","longitude":"23.819690"},{"latitude":"37.998431","longitude":"23.819680"},{"latitude":"37.998435","longitude":"23.819670"},{"latitude":"37.998439","longitude":"23.819660"},{"latitude":"37.998443","longitude":"23.819650"},{"latitude":"37.998447","longitude":"23.819640"},{"latitude":"37.998452","longitude":"23.819630"},{"latitude":"37.998456","longitude":"23.819620"},{"latitude":"37.998460","longitude":"23.819610"},{"latitude":"37.998464","longitude":"23.819600"},{"latitude":"37.998469","longitude":"23.819589"},{"latitude":"37.998473","longitude":"23.819579"},{"latitude":"37.998477","longitude":"23.819569"},{"latitude":"37.998481","longitude":"23.819559"},{"latitude":"37.998485","longitude":"23.819549"},{"latitude":"37.998490","longitude":"23.819539"},{"latitude":"37.998494","longitude":"23.819529"},{"latitude":"37.998498","longitude":"23.819519"},{"latitude":"37.998502","longitude":"23.819509"},{"latitude":"37.998506","longitude":"23.819499"},{"latitude":"37.998511","longitude":"23.819489"},{"latitude":"37.998515","longitude":"23.819479"},{"latitude":"37.998519","longitude":"23.819469"},{"latitude":"37.998523","longitude":"23.819458"},{"latitude":"37.998528","longitude":"23.819448"},{"latitude":"37.998532","longitude":"23.819438"},{"latitude":"37.998536","longitude":"23.819428"},{"latitude":"37.998540","longitude":"23.819418"},{"latitude":"37.998544","longitude":"23.819408"},{"latitude":"37.998549","longitude":"23.819398"},{"latitude":"37.998553","longitude":"23.819388"},{"latitude":"37.998557","longitude":"23.819378"},{"latitude":"37.998561","longitude":"23.819368"},{"latitude":"37.998565","longitude":"23.819358"},{"latitude":"37.998570","longitude":"23.819348"},{"latitude":"37.998574","longitude":"23.819337"},{"latitude":"37.998578","longitude":"23.819327"},{"latitude":"37.998582","longitude":"23.819317"},{"latitude":"37.998587","longitude":"23.819307"},{"latitude":"37.998591","longitude":"23.819297"},{"latitude":"37.998595","longitude":"23.819287"},{"latitude":"37.998599","longitude":"23.819277"},{"latitude":"37.998603","longitude":"23.819267"},{"latitude":"37.998608","longitude":"23.819257"},{"latitude":"37.998612","longitude":"23.819247"},{"latitude":"37.998616","longitude":"23.819237"},{"latitude":"37.998620","longitude":"23.819227"},{"latitude":"37.998624","longitude":"23.819216"},{"latitude":"37.998629","longitude":"23.819206"},{"latitude":"37.998633","longitude":"23.819196"},{"latitude":"37.998637","longitude":"23.819186"},{"latitude":"37.998641","longitude":"23.819176"},{"latitude":"37.998646","longitude":"23.819166"},{"latitude":"37.998650","longitude":"23.819156"},{"latitude":"37.998654","longitude":"23.819146"},{"latitude":"37.998658","longitude":"23.819136"},{"latitude":"37.998662","longitude":"23.819126"},{"latitude":"37.998667","longitude":"23.819116"},{"latitude":"37.998671","longitude":"23.819106"},{"latitude":"37.998675","longitude":"23.819095"},{"latitude":"37.998679","longitude":"23.819085"},{"latitude":"37.998683","longitude":"23.819075"},{"latitude":"37.998688","longitude":"23.819065"},{"latitude":"37.998692","longitude":"23.819055"},{"latitude":"37.998696","longitude":"23.819045"},{"latitude":"37.998700","longitude":"23.819035"},{"latitude":"37.998704","longitude":"23.819025"},{"latitude":"37.998709","longitude":"23.819015"},{"latitude":"37.998713","longitude":"23.819005"},{"latitude":"37.998717","longitude":"23.818995"},{"latitude":"37.998721","longitude":"23.818985"},{"latitude":"37.998726","longitude":"23.818974"},{"latitude":"37.998730","longitude":"23.818964"},{"latitude":"37.998734","longitude":"23.818954"},{"latitude":"37.998738","longitude":"23.818944"},{"latitude":"37.998742","longitude":"23.818934"},{"latitude":"37.998747","longitude":"23.818924"},{"latitude":"37.998751","longitude":"23.818914"},{"latitude":"37.998755","longitude":"23.818904"},{"latitude":"37.998759","longitude":"23.818894"},{"latitude":"37.998763","longitude":"23.818884"},{"latitude":"37.998768","longitude":"23.818874"},{"latitude":"37.998772","longitude":"23.818864"},{"latitude":"37.998776","longitude":"23.818854"},{"latitude":"37.998780","longitude":"23.818843"},{"latitude":"37.998785","longitude":"23.818833"},{"latitude":"37.998789","longitude":"23.818823"},{"latitude":"37.998793","longitude":"23.818813"},{"latitude":"37.998797","longitude":"23.818803"},{"latitude":"37.998801","longitude":"23.818793"},{"latitude":"37.998806","longitude":"23.818783"},{"latitude":"37.998810","longitude":"23.818773"},{"latitude":"37.998814","longitude":"23.818763"},{"latitude":"37.998818","longitude":"23.818753"},{"latitude":"37.998822","longitude":"23.818743"},{"latitude":"37.998827","longitude":"23.818733"},{"latitude":"37.998831","longitude":"23.818722"},{"latitude":"37.998835","longitude":"23.818712"},{"latitude":"37.998839","longitude":"23.818702"},{"latitude":"37.998844","longitude":"23.818692"},{"latitude":"37.998848","longitude":"23.818682"},{"latitude":"37.998852","longitude":"23.818672"},{"latitude":"37.998856","longitude":"23.818662"},{"latitude":"37.998860","longitude":"23.818652"},{"latitude":"37.998865","longitude":"23.818642"},{"latitude":"37.998869","longitude":"23.818632"},{"latitude":"37.998873","longitude":"23.818622"},{"latitude":"37.998877","longitude":"23.818612"},{"latitude":"37.998881","longitude":"23.818601"},{"latitude":"37.998886","longitude":"23.818591"},{"latitude":"37.998890","longitude":"23.818581"},{"latitude":"37.998894","longitude":"23.818571"},{"latitude":"37.998898","longitude":"23.818561"},{"latitude":"37.998903","longitude":"23.818551"},{"latitude":"37.998907","longitude":"23.818541"},{"latitude":"37.998911","longitude":"23.818531"},{"latitude":"37.998915","longitude":"23.818521"},{"latitude":"37.998919","longitude":"23.818511"},{"latitude":"37.998924","longitude":"23.818501"},{"latitude":"37.998928","longitude":"23.818491"},{"latitude":"37.998932","longitude":"23.818480"},{"latitude":"37.998936","longitude":"23.818470"},{"latitude":"37.998940","longitude":"23.818460"},{"latitude":"37.998945","longitude":"23.818450"},{"latitude":"37.998949","longitude":"23.818440"},{"latitude":"37.998953","longitude":"23.818430"},{"latitude":"37.998957","longitude":"23.818420"},{"latitude":"37.998962","longitude":"23.818410"},{"latitude":"37.998966","longitude":"23.818400"},{"latitude":"37.998970","longitude":"23.818390"},{"latitude":"37.998974","longitude":"23.818380"},{"latitude":"37.998978","longitude":"23.818370"},{"latitude":"37.998983","longitude":"23.818359"},{"latitude":"37.998987","longitude":"23.818349"},{"latitude":"37.998991","longitude":"23.818339"},{"latitude":"37.998995","longitude":"23.818329"},{"latitude":"37.998999","longitude":"23.818319"},{"latitude":"37.999004","longitude":"23.818309"},{"latitude":"37.999008","longitude":"23.818299"},{"latitude":"37.999012","longitude":"23.818289"},{"latitude":"37.999016","longitude":"23.818279"},{"latitude":"37.999021","longitude":"23.818269"},{"latitude":"37.999025","longitude":"23.818259"},{"latitude":"37.999029","longitude":"23.818249"},{"latitude":"37.999033","longitude":"23.818239"},{"latitude":"37.999037","longitude":"23.818228"},{"latitude":"37.999042","longitude":"23.818218"},{"latitude":"37.999046","longitude":"23.818208"},{"latitude":"37.999050","longitude":"23.818198"},{"latitude":"37.999054","longitude":"23.818188"},{"latitude":"37.999058","longitude":"23.818178"},{"latitude":"37.999063","longitude":"23.818168"},{"latitude":"37.999067","longitude":"23.818158"},{"latitude":"37.999071","longitude":"23.818148"},{"latitude":"37.999075","longitude":"23.818138"},{"latitude":"37.999080","longitude":"23.818128"},{"latitude":"37.999084","longitude":"23.818118"},{"latitude":"37.999088","longitude":"23.818107"},{"latitude":"37.999092","longitude":"23.818097"},{"latitude":"37.999096","longitude":"23.818087"},{"latitude":"37.999101","longitude":"23.818077"},{"latitude":"37.999105","longitude":"23.818067"},{"latitude":"37.999109","longitude":"23.818057"},{"latitude":"37.999113","longitude":"23.818047"},{"latitude":"37.999117","longitude":"23.818037"},{"latitude":"37.999122","longitude":"23.818027"},{"latitude":"37.999126","longitude":"23.818017"},{"latitude":"37.999130","longitude":"23.818007"},{"latitude":"37.999134","longitude":"23.817997"},{"latitude":"37.999139","longitude":"23.817986"},{"latitude":"37.999143","longitude":"23.817976"},{"latitude":"37.999147","longitude":"23.817966"},{"latitude":"37.999151","longitude":"23.817956"},{"latitude":"37.999155","longitude":"23.817946"},{"latitude":"37.999160","longitude":"23.817936"},{"latitude":"37.999164","longitude":"23.817926"},{"latitude":"37.999168","longitude":"23.817916"},{"latitude":"37.999172","longitude":"23.817906"},{"latitude":"37.999176","longitude":"23.817896"},{"latitude":"37.999181","longitude":"23.817886"},{"latitude":"37.999185","longitude":"23.817876"},{"latitude":"37.999189","longitude":"23.817865"},{"latitude":"37.999193","longitude":"23.817855"},{"latitude":"37.999198","longitude":"23.817845"},{"latitude":"37.999202","longitude":"23.817835"},{"latitude":"37.999206","longitude":"23.817825"},{"latitude":"37.999210","longitude":"23.817815"},{"latitude":"37.999214","longitude":"23.817805"},{"latitude":"37.999219","longitude":"23.817795"},{"latitude":"37.999223","longitude":"23.817785"},{"latitude":"37.999227","longitude":"23.817775"},{"latitude":"37.999231","longitude":"23.817765"},{"latitude":"37.999235","longitude":"23.817755"},{"latitude":"37.999240","longitude":"23.817744"},{"latitude":"37.999244","longitude":"23.817734"},{"latitude":"37.999248","longitude":"23.817724"},{"latitude":"37.999252","longitude":"23.817714"},{"latitude":"37.999257","longitude":"23.817704"},{"latitude":"37.999261","longitude":"23.817694"},{"latitude":"37.999265","longitude":"23.817684"},{"latitude":"37.999269","longitude":"23.817674"},{"latitude":"37.999267","longitude":"23.817658"},{"latitude":"37.999262","longitude":"23.817648"},{"latitude":"37.999257","longitude":"23.817639"},{"latitude":"37.999249","longitude":"23.817640"},{"latitude":"37.999244","longitude":"23.817650"},{"latitude":"37.999240","longitude":"23.817660"},{"latitude":"37.999236","longitude":"23.817670"},{"latitude":"37.999232","longitude":"23.817680"},{"latitude":"37.999228","longitude":"23.817690"},{"latitude":"37.999223","longitude":"23.817700"},{"latitude":"37.999219","longitude":"23.817710"},{"latitude":"37.999215","longitude":"23.817720"},{"latitude":"37.999211","longitude":"23.817731"},{"latitude":"37.999206","longitude":"23.817741"},{"latitude":"37.999202","longitude":"23.817751"},{"latitude":"37.999198","longitude":"23.817761"},{"latitude":"37.999194","longitude":"23.817771"},{"latitude":"37.999189","longitude":"23.817781"},{"latitude":"37.999185","longitude":"23.817791"},{"latitude":"37.999181","longitude":"23.817801"},{"latitude":"37.999177","longitude":"23.817811"},{"latitude":"37.999173","longitude":"23.817821"},{"latitude":"37.999168","longitude":"23.817831"},{"latitude":"37.999164","longitude":"23.817841"},{"latitude":"37.999160","longitude":"23.817851"},{"latitude":"37.999156","longitude":"23.817862"},{"latitude":"37.999151","longitude":"23.817872"},{"latitude":"37.999147","longitude":"23.817882"},{"latitude":"37.999143","longitude":"23.817892"},{"latitude":"37.999139","longitude":"23.817902"},{"latitude":"37.999135","longitude":"23.817912"},{"latitude":"37.999130","longitude":"23.817922"},{"latitude":"37.999126","longitude":"23.817932"},{"latitude":"37.999122","longitude":"23.817942"},{"latitude":"37.999118","longitude":"23.817952"},{"latitude":"37.999113","longitude":"23.817962"},{"latitude":"37.999109","longitude":"23.817972"},{"latitude":"37.999105","longitude":"23.817982"},{"latitude":"37.999101","longitude":"23.817992"},{"latitude":"37.999097","longitude":"23.818003"},{"latitude":"37.999092","longitude":"23.818013"},{"latitude":"37.999088","longitude":"23.818023"},{"latitude":"37.999084","longitude":"23.818033"},{"latitude":"37.999080","longitude":"23.818043"},{"latitude":"37.999075","longitude":"23.818053"},{"latitude":"37.999071","longitude":"23.818063"},{"latitude":"37.999067","longitude":"23.818073"},{"latitude":"37.999063","longitude":"23.818083"},{"latitude":"37.999059","longitude":"23.818093"},{"latitude":"37.999054","longitude":"23.818103"},{"latitude":"37.999050","longitude":"23.818113"},{"latitude":"37.999046","longitude":"23.818123"},{"latitude":"37.999042","longitude":"23.818134"},{"latitude":"37.999037","longitude":"23.818144"},{"latitude":"37.999033","longitude":"23.818154"},{"latitude":"37.999029","longitude":"23.818164"},{"latitude":"37.999025","longitude":"23.818174"},{"latitude":"37.999020","longitude":"23.818184"},{"latitude":"37.999016","longitude":"23.818194"},{"latitude":"37.999012","longitude":"23.818204"},{"latitude":"37.999008","longitude":"23.818214"},{"latitude":"37.999004","longitude":"23.818224"},{"latitude":"37.998999","longitude":"23.818234"},{"latitude":"37.998995","longitude":"23.818244"},{"latitude":"37.998991","longitude":"23.818254"},{"latitude":"37.998987","longitude":"23.818265"},{"latitude":"37.998982","longitude":"23.818275"},{"latitude":"37.998978","longitude":"23.818285"},{"latitude":"37.998974","longitude":"23.818295"},{"latitude":"37.998970","longitude":"23.818305"},{"latitude":"37.998966","longitude":"23.818315"},{"latitude":"37.998961","longitude":"23.818325"},{"latitude":"37.998957","longitude":"23.818335"},{"latitude":"37.998953","longitude":"23.818345"},{"latitude":"37.998949","longitude":"23.818355"},{"latitude":"37.998944","longitude":"23.818365"},{"latitude":"37.998940","longitude":"23.818375"},{"latitude":"37.998936","longitude":"23.818385"},{"latitude":"37.998932","longitude":"23.818395"},{"latitude":"37.998928","longitude":"23.818406"},{"latitude":"37.998923","longitude":"23.818416"},{"latitude":"37.998919","longitude":"23.818426"},{"latitude":"37.998915","longitude":"23.818436"},{"latitude":"37.998911","longitude":"23.818446"},{"latitude":"37.998906","longitude":"23.818456"},{"latitude":"37.998902","longitude":"23.818466"},{"latitude":"37.998898","longitude":"23.818476"},{"latitude":"37.998894","longitude":"23.818486"},{"latitude":"37.998890","longitude":"23.818496"},{"latitude":"37.998885","longitude":"23.818506"},{"latitude":"37.998881","longitude":"23.818516"},{"latitude":"37.998877","longitude":"23.818526"},{"latitude":"37.998873","longitude":"23.818537"},{"latitude":"37.998868","longitude":"23.818547"},{"latitude":"37.998864","longitude":"23.818557"},{"latitude":"37.998860","longitude":"23.818567"},{"latitude":"37.998856","longitude":"23.818577"},{"latitude":"37.998851","longitude":"23.818587"},{"latitude":"37.998847","longitude":"23.818597"},{"latitude":"37.998843","longitude":"23.818607"},{"latitude":"37.998839","longitude":"23.818617"},{"latitude":"37.998835","longitude":"23.818627"},{"latitude":"37.998830","longitude":"23.818637"},{"latitude":"37.998826","longitude":"23.818647"},{"latitude":"37.998822","longitude":"23.818657"},{"latitude":"37.998818","longitude":"23.818667"},{"latitude":"37.998813","longitude":"23.818678"},{"latitude":"37.998809","longitude":"23.818688"},{"latitude":"37.998805","longitude":"23.818698"},{"latitude":"37.998801","longitude":"23.818708"},{"latitude":"37.998797","longitude":"23.818718"},{"latitude":"37.998792","longitude":"23.818728"},{"latitude":"37.998788","longitude":"23.818738"},{"latitude":"37.998784","longitude":"23.818748"},{"latitude":"37.998780","longitude":"23.818758"},{"latitude":"37.998775","longitude":"23.818768"},{"latitude":"37.998771","longitude":"23.818778"},{"latitude":"37.998767","longitude":"23.818788"},{"latitude":"37.998763","longitude":"23.818798"},{"latitude":"37.998759","longitude":"23.818809"},{"latitude":"37.998754","longitude":"23.818819"},{"latitude":"37.998750","longitude":"23.818829"},{"latitude":"37.998746","longitude":"23.818839"},{"latitude":"37.998742","longitude":"23.818849"},{"latitude":"37.998737","longitude":"23.818859"},{"latitude":"37.998733","longitude":"23.818869"},{"latitude":"37.998729","longitude":"23.818879"},{"latitude":"37.998725","longitude":"23.818889"},{"latitude":"37.998721","longitude":"23.818899"},{"latitude":"37.998716","longitude":"23.818909"},{"latitude":"37.998712","longitude":"23.818919"},{"latitude":"37.998708","longitude":"23.818929"},{"latitude":"37.998704","longitude":"23.818939"},{"latitude":"37.998699","longitude":"23.818950"},{"latitude":"37.998695","longitude":"23.818960"},{"latitude":"37.998691","longitude":"23.818970"},{"latitude":"37.998687","longitude":"23.818980"},{"latitude":"37.998682","longitude":"23.818990"},{"latitude":"37.998678","longitude":"23.819000"},{"latitude":"37.998674","longitude":"23.819010"},{"latitude":"37.998670","longitude":"23.819020"},{"latitude":"37.998666","longitude":"23.819030"},{"latitude":"37.998661","longitude":"23.819040"},{"latitude":"37.998657","longitude":"23.819050"},{"latitude":"37.998653","longitude":"23.819060"},{"latitude":"37.998649","longitude":"23.819070"},{"latitude":"37.998644","longitude":"23.819081"},{"latitude":"37.998640","longitude":"23.819091"},{"latitude":"37.998636","longitude":"23.819101"},{"latitude":"37.998632","longitude":"23.819111"},{"latitude":"37.998628","longitude":"23.819121"},{"latitude":"37.998623","longitude":"23.819131"},{"latitude":"37.998619","longitude":"23.819141"},{"latitude":"37.998615","longitude":"23.819151"},{"latitude":"37.998611","longitude":"23.819161"},{"latitude":"37.998606","longitude":"23.819171"},{"latitude":"37.998602","longitude":"23.819181"},{"latitude":"37.998598","longitude":"23.819191"},{"latitude":"37.998594","longitude":"23.819201"},{"latitude":"37.998590","longitude":"23.819212"},{"latitude":"37.998585","longitude":"23.819222"},{"latitude":"37.998581","longitude":"23.819232"},{"latitude":"37.998577","longitude":"23.819242"},{"latitude":"37.998573","longitude":"23.819252"},{"latitude":"37.998568","longitude":"23.819262"},{"latitude":"37.998564","longitude":"23.819272"},{"latitude":"37.998560","longitude":"23.819282"},{"latitude":"37.998556","longitude":"23.819292"},{"latitude":"37.998551","longitude":"23.819302"},{"latitude":"37.998547","longitude":"23.819312"},{"latitude":"37.998543","longitude":"23.819322"},{"latitude":"37.998539","longitude":"23.819332"},{"latitude":"37.998535","longitude":"23.819342"},{"latitude":"37.998530","longitude":"23.819353"},{"latitude":"37.998526","longitude":"23.819363"},{"latitude":"37.998522","longitude":"23.819373"},{"latitude":"37.998518","longitude":"23.819383"},{"latitude":"37.998513","longitude":"23.819393"},{"latitude":"37.998509","longitude":"23.819403"},{"latitude":"37.998505","longitude":"23.819413"},{"latitude":"37.998501","longitude":"23.819423"},{"latitude":"37.998497","longitude":"23.819433"},{"latitude":"37.998492","longitude":"23.819443"},{"latitude":"37.998488","longitude":"23.819453"},{"latitude":"37.998484","longitude":"23.819463"},{"latitude":"37.998480","longitude":"23.819473"},{"latitude":"37.998475","longitude":"23.819484"},{"latitude":"37.998471","longitude":"23.819494"},{"latitude":"37.998467","longitude":"23.819504"},{"latitude":"37.998463","longitude":"23.819514"},{"latitude":"37.998459","longitude":"23.819524"},{"latitude":"37.998454","longitude":"23.819534"},{"latitude":"37.998450","longitude":"23.819544"},{"latitude":"37.998446","longitude":"23.819554"},{"latitude":"37.998442","longitude":"23.819564"},{"latitude":"37.998437","longitude":"23.819574"},{"latitude":"37.998433","longitude":"23.819584"},{"latitude":"37.998429","longitude":"23.819594"},{"latitude":"37.998425","longitude":"23.819604"},{"latitude":"37.998421","longitude":"23.819614"},{"latitude":"37.998416","longitude":"23.819625"},{"latitude":"37.998412","longitude":"23.819635"},{"latitude":"37.998408","longitude":"23.819645"},{"latitude":"37.998404","longitude":"23.819655"},{"latitude":"37.998399","longitude":"23.819665"},{"latitude":"37.998395","longitude":"23.819675"},{"latitude":"37.998391","longitude":"23.819685"},{"latitude":"37.998387","longitude":"23.819695"},{"latitude":"37.998382","longitude":"23.819705"},{"latitude":"37.998371","longitude":"23.819707"},{"latitude":"37.998363","longitude":"23.819704"},{"latitude":"37.998355","longitude":"23.819700"},{"latitude":"37.998346","longitude":"23.819696"},{"latitude":"37.998338","longitude":"23.819692"},{"latitude":"37.998329","longitude":"23.819688"},{"latitude":"37.998321","longitude":"23.819684"},{"latitude":"37.998312","longitude":"23.819680"},{"latitude":"37.998304","longitude":"23.819677"},{"latitude":"37.998295","longitude":"23.819673"},{"latitude":"37.998287","longitude":"23.819669"},{"latitude":"37.998278","longitude":"23.819665"},{"latitude":"37.998270","longitude":"23.819661"},{"latitude":"37.998261","longitude":"23.819657"},{"latitude":"37.998253","longitude":"23.819653"},{"latitude":"37.998244","longitude":"23.819650"},{"latitude":"37.998236","longitude":"23.819646"},{"latitude":"37.998228","longitude":"23.819642"},{"latitude":"37.998219","longitude":"23.819638"},{"latitude":"37.998211","longitude":"23.819634"},{"latitude":"37.998202","longitude":"23.819630"},{"latitude":"37.998194","longitude":"23.819626"},{"latitude":"37.998185","longitude":"23.819623"},{"latitude":"37.998177","longitude":"23.819619"},{"latitude":"37.998168","longitude":"23.819615"},{"latitude":"37.998160","longitude":"23.819611"},{"latitude":"37.998150","longitude":"23.819601"},{"latitude":"37.998143","longitude":"23.819593"},{"latitude":"37.998137","longitude":"23.819585"},{"latitude":"37.998131","longitude":"23.819577"},{"latitude":"37.998124","longitude":"23.819569"},{"latitude":"37.998118","longitude":"23.819561"},{"latitude":"37.998112","longitude":"23.819553"},{"latitude":"37.998105","longitude":"23.819545"},{"latitude":"37.998099","longitude":"23.819536"},{"latitude":"37.998093","longitude":"23.819528"},{"latitude":"37.998086","longitude":"23.819520"},{"latitude":"37.998080","longitude":"23.819512"},{"latitude":"37.998073","longitude":"23.819504"},{"latitude":"37.998067","longitude":"23.819496"},{"latitude":"37.998061","longitude":"23.819488"},{"latitude":"37.998054","longitude":"23.819480"},{"latitude":"37.998048","longitude":"23.819472"},{"latitude":"37.998042","longitude":"23.819464"},{"latitude":"37.998035","longitude":"23.819455"},{"latitude":"37.998029","longitude":"23.819447"},{"latitude":"37.998023","longitude":"23.819439"},{"latitude":"37.998016","longitude":"23.819431"},{"latitude":"37.998010","longitude":"23.819423"},{"latitude":"37.998004","longitude":"23.819415"},{"latitude":"37.997997","longitude":"23.819407"},{"latitude":"37.997991","longitude":"23.819399"},{"latitude":"37.997985","longitude":"23.819391"},{"latitude":"37.997978","longitude":"23.819383"},{"latitude":"37.997972","longitude":"23.819375"},{"latitude":"37.997966","longitude":"23.819366"},{"latitude":"37.997959","longitude":"23.819358"},{"latitude":"37.997953","longitude":"23.819350"},{"latitude":"37.997947","longitude":"23.819342"},{"latitude":"37.997940","longitude":"23.819334"},{"latitude":"37.997934","longitude":"23.819326"},{"latitude":"37.997928","longitude":"23.819318"},{"latitude":"37.997921","longitude":"23.819310"},{"latitude":"37.997915","longitude":"23.819302"},{"latitude":"37.997909","longitude":"23.819294"},{"latitude":"37.997902","longitude":"23.819285"},{"latitude":"37.997896","longitude":"23.819277"},{"latitude":"37.997890","longitude":"23.819269"},{"latitude":"37.997883","longitude":"23.819261"},{"latitude":"37.997877","longitude":"23.819253"},{"latitude":"37.997871","longitude":"23.819245"},{"latitude":"37.997864","longitude":"23.819237"},{"latitude":"37.997858","longitude":"23.819229"},{"latitude":"37.997852","longitude":"23.819221"},{"latitude":"37.997845","longitude":"23.819213"},{"latitude":"37.997839","longitude":"23.819204"},{"latitude":"37.997833","longitude":"23.819196"},{"latitude":"37.997826","longitude":"23.819188"},{"latitude":"37.997820","longitude":"23.819180"},{"latitude":"37.997814","longitude":"23.819172"},{"latitude":"37.997807","longitude":"23.819164"},{"latitude":"37.997801","longitude":"23.819156"},{"latitude":"37.997795","longitude":"23.819148"},{"latitude":"37.997788","longitude":"23.819140"},{"latitude":"37.997782","longitude":"23.819132"},{"latitude":"37.997776","longitude":"23.819124"},{"latitude":"37.997769","longitude":"23.819115"},{"latitude":"37.997763","longitude":"23.819107"},{"latitude":"37.997757","longitude":"23.819099"},{"latitude":"37.997750","longitude":"23.819091"},{"latitude":"37.997744","longitude":"23.819083"},{"latitude":"37.997738","longitude":"23.819075"},{"latitude":"37.997731","longitude":"23.819067"},{"latitude":"37.997725","longitude":"23.819059"},{"latitude":"37.997719","longitude":"23.819051"},{"latitude":"37.997712","longitude":"23.819043"},{"latitude":"37.997706","longitude":"23.819034"},{"latitude":"37.997700","longitude":"23.819026"},{"latitude":"37.997693","longitude":"23.819018"},{"latitude":"37.997687","longitude":"23.819010"},{"latitude":"37.997681","longitude":"23.819002"},{"latitude":"37.997674","longitude":"23.818994"},{"latitude":"37.997668","longitude":"23.818986"},{"latitude":"37.997661","longitude":"23.818978"},{"latitude":"37.997655","longitude":"23.818970"},{"latitude":"37.997649","longitude":"23.818962"},{"latitude":"37.997642","longitude":"23.818954"},{"latitude":"37.997636","longitude":"23.818945"},{"latitude":"37.997630","longitude":"23.818937"},{"latitude":"37.997623","longitude":"23.818929"},{"latitude":"37.997617","longitude":"23.818921"},{"latitude":"37.997611","longitude":"23.818913"},{"latitude":"37.997604","longitude":"23.818905"},{"latitude":"37.997598","longitude":"23.818897"},{"latitude":"37.997592","longitude":"23.818889"},{"latitude":"37.997585","longitude":"23.818881"},{"latitude":"37.997579","longitude":"23.818873"},{"latitude":"37.997573","longitude":"23.818864"},{"latitude":"37.997566","longitude":"23.818856"},{"latitude":"37.997560","longitude":"23.818848"},{"latitude":"37.997554","longitude":"23.818840"},{"latitude":"37.997547","longitude":"23.818832"},{"latitude":"37.997541","longitude":"23.818824"},{"latitude":"37.997535","longitude":"23.818816"},{"latitude":"37.997528","longitude":"23.818808"},{"latitude":"37.997522","longitude":"23.818800"},{"latitude":"37.997516","longitude":"23.818792"},{"latitude":"37.997509","longitude":"23.818784"},{"latitude":"37.997503","longitude":"23.818775"},{"latitude":"37.997497","longitude":"23.818767"},{"latitude":"37.997490","longitude":"23.818759"},{"latitude":"37.997484","longitude":"23.818751"},{"latitude":"37.997478","longitude":"23.818743"},{"latitude":"37.997471","longitude":"23.818735"},{"latitude":"37.997465","longitude":"23.818727"},{"latitude":"37.997459","longitude":"23.818719"},{"latitude":"37.997452","longitude":"23.818711"},{"latitude":"37.997446","longitude":"23.818703"},{"latitude":"37.997440","longitude":"23.818694"},{"latitude":"37.997433","longitude":"23.818686"},{"latitude":"37.997427","longitude":"23.818678"},{"latitude":"37.997421","longitude":"23.818670"},{"latitude":"37.997414","longitude":"23.818662"},{"latitude":"37.997408","longitude":"23.818654"},{"latitude":"37.997402","longitude":"23.818646"},{"latitude":"37.997395","longitude":"23.818638"},{"latitude":"37.997389","longitude":"23.818630"},{"latitude":"37.997383","longitude":"23.818622"},{"latitude":"37.997376","longitude":"23.818614"},{"latitude":"37.997370","longitude":"23.818605"},{"latitude":"37.997364","longitude":"23.818597"},{"latitude":"37.997357","longitude":"23.818589"},{"latitude":"37.997351","longitude":"23.818581"},{"latitude":"37.997345","longitude":"23.818573"},{"latitude":"37.997338","longitude":"23.818565"},{"latitude":"37.997332","longitude":"23.818557"},{"latitude":"37.997326","longitude":"23.818549"},{"latitude":"37.997319","longitude":"23.818541"},{"latitude":"37.997313","longitude":"23.818533"},{"latitude":"37.997307","longitude":"23.818524"},{"latitude":"37.997300","longitude":"23.818516"},{"latitude":"37.997294","longitude":"23.818508"},{"latitude":"37.997288","longitude":"23.818500"},{"latitude":"37.997281","longitude":"23.818492"},{"latitude":"37.997275","longitude":"23.818484"},{"latitude":"37.997269","longitude":"23.818476"},{"latitude":"37.997262","longitude":"23.818468"},{"latitude":"37.997256","longitude":"23.818460"},{"latitude":"37.997249","longitude":"23.818452"},{"latitude":"37.997243","longitude":"23.818443"},{"latitude":"37.997237","longitude":"23.818435"},{"latitude":"37.997230","longitude":"23.818427"},{"latitude":"37.997224","longitude":"23.818419"},{"latitude":"37.997218","longitude":"23.818411"},{"latitude":"37.997211","longitude":"23.818403"},{"latitude":"37.997205","longitude":"23.818395"},{"latitude":"37.997199","longitude":"23.818387"},{"latitude":"37.997192","longitude":"23.818379"},{"latitude":"37.997186","longitude":"23.818371"},{"latitude":"37.997173","longitude":"23.818370"},{"latitude":"37.997165","longitude":"23.818375"},{"latitude":"37.997157","longitude":"23.818380"},{"latitude":"37.997149","longitude":"23.818385"},{"latitude":"37.997141","longitude":"23.818390"},{"latitude":"37.997133","longitude":"23.818395"},{"latitude":"37.997125","longitude":"23.818400"},{"latitude":"37.997117","longitude":"23.818405"},{"latitude":"37.997109","longitude":"23.818410"},{"latitude":"37.997101","longitude":"23.818415"},{"latitude":"37.997093","longitude":"23.818420"},{"latitude":"37.997085","longitude":"23.818425"},{"latitude":"37.997077","longitude":"23.818430"},{"latitude":"37.997069","longitude":"23.818436"},{"latitude":"37.997061","longitude":"23.818441"},{"latitude":"37.997052","longitude":"23.818446"},{"latitude":"37.997044","longitude":"23.818451"},{"latitude":"37.997036","longitude":"23.818456"},{"latitude":"37.997028","longitude":"23.818461"},{"latitude":"37.997020","longitude":"23.818466"},{"latitude":"37.997012","longitude":"23.818471"},{"latitude":"37.997004","longitude":"23.818476"},{"latitude":"37.996996","longitude":"23.818481"},{"latitude":"37.996988","longitude":"23.818486"},{"latitude":"37.996980","longitude":"23.818491"},{"latitude":"37.996972","longitude":"23.818496"},{"latitude":"37.996964","longitude":"23.818501"},{"latitude":"37.996956","longitude":"23.818506"},{"latitude":"37.996948","longitude":"23.818511"},{"latitude":"37.996940","longitude":"23.818516"},{"latitude":"37.996932","longitude":"23.818521"},{"latitude":"37.996923","longitude":"23.818526"},{"latitude":"37.996915","longitude":"23.818532"},{"latitude":"37.996907","longitude":"23.818537"},{"latitude":"37.996899","longitude":"23.818542"},{"latitude":"37.996891","longitude":"23.818547"},{"latitude":"37.996883","longitude":"23.818552"},{"latitude":"37.996875","longitude":"23.818557"},{"latitude":"37.996867","longitude":"23.818562"},{"latitude":"37.996859","longitude":"23.818567"},{"latitude":"37.996851","longitude":"23.818572"},{"latitude":"37.996843","longitude":"23.818577"},{"latitude":"37.996835","longitude":"23.818582"},{"latitude":"37.996827","longitude":"23.818587"},{"latitude":"37.996819","longitude":"23.818592"},{"latitude":"37.996811","longitude":"23.818597"},{"latitude":"37.996803","longitude":"23.818602"},{"latitude":"37.996794","longitude":"23.818607"},{"latitude":"37.996786","longitude":"23.818612"},{"latitude":"37.996778","longitude":"23.818617"},{"latitude":"37.996770","longitude":"23.818623"},{"latitude":"37.996762","longitude":"23.818628"},{"latitude":"37.996754","longitude":"23.818633"},{"latitude":"37.996746","longitude":"23.818638"},{"latitude":"37.996738","longitude":"23.818643"},{"latitude":"37.996730","longitude":"23.818648"},{"latitude":"37.996722","longitude":"23.818653"},{"latitude":"37.996714","longitude":"23.818658"},{"latitude":"37.996706","longitude":"23.818663"},{"latitude":"37.996698","longitude":"23.818668"},{"latitude":"37.996690","longitude":"23.818673"},{"latitude":"37.996682","longitude":"23.818678"},{"latitude":"37.996674","longitude":"23.818683"},{"latitude":"37.996665","longitude":"23.818688"},{"latitude":"37.996657","longitude":"23.818693"},{"latitude":"37.996649","longitude":"23.818698"},{"latitude":"37.996641","longitude":"23.818703"},{"latitude":"37.996633","longitude":"23.818708"},{"latitude":"37.996625","longitude":"23.818714"},{"latitude":"37.996617","longitude":"23.818719"},{"latitude":"37.996609","longitude":"23.818724"},{"latitude":"37.996601","longitude":"23.818729"},{"latitude":"37.996593","longitude":"23.818734"},{"latitude":"37.996585","longitude":"23.818739"},{"latitude":"37.996577","longitude":"23.818744"},{"latitude":"37.996569","longitude":"23.818749"},{"latitude":"37.996561","longitude":"23.818754"},{"latitude":"37.996553","longitude":"23.818759"},{"latitude":"37.996545","longitude":"23.818764"},{"latitude":"37.996536","longitude":"23.818769"},{"latitude":"37.996528","longitude":"23.818774"},{"latitude":"37.996520","longitude":"23.818779"},{"latitude":"37.996512","longitude":"23.818784"},{"latitude":"37.996504","longitude":"23.818789"},{"latitude":"37.996496","longitude":"23.818794"},{"latitude":"37.996488","longitude":"23.818799"},{"latitude":"37.996480","longitude":"23.818805"},{"latitude":"37.996472","longitude":"23.818810"},{"latitude":"37.996464","longitude":"23.818815"},{"latitude":"37.996456","longitude":"23.818820"},{"latitude":"37.996448","longitude":"23.818825"},{"latitude":"37.996440","longitude":"23.818830"},{"latitude":"37.996432","longitude":"23.818835"},{"latitude":"37.996424","longitude":"23.818840"},{"latitude":"37.996416","longitude":"23.818845"},{"latitude":"37.996407","longitude":"23.818850"},{"latitude":"37.996399","longitude":"23.818855"},{"latitude":"37.996391","longitude":"23.818860"},{"latitude":"37.996383","longitude":"23.818865"},{"latitude":"37.996375","longitude":"23.818870"},{"latitude":"37.996367","longitude":"23.818875"},{"latitude":"37.996359","longitude":"23.818880"},{"latitude":"37.996351","longitude":"23.818885"},{"latitude":"37.996343","longitude":"23.818890"},{"latitude":"37.996335","longitude":"23.818895"},{"latitude":"37.996327","longitude":"23.818901"},{"latitude":"37.996319","longitude":"23.818906"},{"latitude":"37.996311","longitude":"23.818911"},{"latitude":"37.996303","longitude":"23.818916"},{"latitude":"37.996295","longitude":"23.818921"},{"latitude":"37.996287","longitude":"23.818926"},{"latitude":"37.996278","longitude":"23.818931"},{"latitude":"37.996270","longitude":"23.818936"},{"latitude":"37.996262","longitude":"23.818941"},{"latitude":"37.996254","longitude":"23.818946"},{"latitude":"37.996246","longitude":"23.818951"},{"latitude":"37.996238","longitude":"23.818956"},{"latitude":"37.996230","longitude":"23.818961"},{"latitude":"37.996222","longitude":"23.818966"},{"latitude":"37.996214","longitude":"23.818971"},{"latitude":"37.996206","longitude":"23.818976"},{"latitude":"37.996198","longitude":"23.818981"},{"latitude":"37.996190","longitude":"23.818986"},{"latitude":"37.996182","longitude":"23.818992"},{"latitude":"37.996174","longitude":"23.818997"},{"latitude":"37.996166","longitude":"23.819002"},{"latitude":"37.996157","longitude":"23.819007"},{"latitude":"37.996149","longitude":"23.819012"},{"latitude":"37.996141","longitude":"23.819017"},{"latitude":"37.996133","longitude":"23.819022"},{"latitude":"37.996125","longitude":"23.819027"},{"latitude":"37.996117","longitude":"23.819032"},{"latitude":"37.996113","longitude":"23.819022"},{"latitude":"37.996109","longitude":"23.819011"},{"latitude":"37.996106","longitude":"23.819001"},{"latitude":"37.996103","longitude":"23.818990"},{"latitude":"37.996099","longitude":"23.818980"},{"latitude":"37.996096","longitude":"23.818969"},{"latitude":"37.996092","longitude":"23.818959"},{"latitude":"37.996089","longitude":"23.818948"},{"latitude":"37.996085","longitude":"23.818938"},{"latitude":"37.996082","longitude":"23.818927"},{"latitude":"37.996079","longitude":"23.818917"},{"latitude":"37.996075","longitude":"23.818906"},{"latitude":"37.996072","longitude":"23.818895"},{"latitude":"37.996068","longitude":"23.818885"},{"latitude":"37.996065","longitude":"23.818874"},{"latitude":"37.996061","longitude":"23.818864"},{"latitude":"37.996058","longitude":"23.818853"},{"latitude":"37.996055","longitude":"23.818843"},{"latitude":"37.996051","longitude":"23.818832"},{"latitude":"37.996048","longitude":"23.818822"},{"latitude":"37.996044","longitude":"23.818811"},{"latitude":"37.996041","longitude":"23.818800"},{"latitude":"37.996038","longitude":"23.818790"},{"latitude":"37.996034","longitude":"23.818779"},{"latitude":"37.996031","longitude":"23.818769"},{"latitude":"37.996027","longitude":"23.818758"},{"latitude":"37.996024","longitude":"23.818748"},{"latitude":"37.996020","longitude":"23.818737"},{"latitude":"37.996017","longitude":"23.818727"},{"latitude":"37.996014","longitude":"23.818716"},{"latitude":"37.996010","longitude":"23.818705"},{"latitude":"37.996007","longitude":"23.818695"},{"latitude":"37.996003","longitude":"23.818684"},{"latitude":"37.996000","longitude":"23.818674"},{"latitude":"37.995997","longitude":"23.818663"},{"latitude":"37.995993","longitude":"23.818653"},{"latitude":"37.995990","longitude":"23.818642"},{"latitude":"37.995997","longitude":"23.818636"},{"latitude":"37.996005","longitude":"23.818631"},{"latitude":"37.996013","longitude":"23.818625"},{"latitude":"37.996021","longitude":"23.818620"},{"latitude":"37.996029","longitude":"23.818615"},{"latitude":"37.996037","longitude":"23.818610"},{"latitude":"37.996045","longitude":"23.818605"},{"latitude":"37.996053","longitude":"23.818600"},{"latitude":"37.996062","longitude":"23.818594"},{"latitude":"37.996070","longitude":"23.818589"},{"latitude":"37.996078","longitude":"23.818584"},{"latitude":"37.996086","longitude":"23.818579"},{"latitude":"37.996094","longitude":"23.818574"},{"latitude":"37.996102","longitude":"23.818569"},{"latitude":"37.996110","longitude":"23.818563"}],
   "start_point": {
    "latitude": 37.996095,
    "longitude": 23.818562
  },
  "end_point": {
    "latitude": 37.996110,
    "longitude": 23.818563
  },
  "color": "blue"
}'

echo 'Initiallizing gNBs for admin...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/gNBs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "gNB_id": "AAAAA1",
  "name": "gNB1",
  "description": "This is a base station",
  "location": "unknown"
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/gNBs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "gNB_id": "AAAAA2",
  "name": "gNB2",
  "description": "This is a base station",
  "location": "unknown"
}'

echo 'Initiallizing Cells for admin...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA1001",
  "name": "cell1",
  "description": "This is a cell",
  "gNB_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA1002",
  "name": "cell2",
  "description": "This is a cell",
  "gNB_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA1003",
  "name": "cell3",
  "description": "This is a cell",
  "gNB_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA2001",
  "name": "cell4",
  "description": "This is a cell",
  "gNB_id": 2
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA2002",
  "name": "cell5",
  "description": "This is a cell",
  "gNB_id": 2
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "AAAAA2003",
  "name": "cell6",
  "description": "This is a cell",
  "gNB_id": 2
}'

echo 'Initiallizing UEs for admin...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000001",
  "name": "UE1",
  "description": "This is a UE",
  "gNB_id": 1,
  "Cell_id": 1,
  "ip_address_v4": "10.0.0.1",
  "ip_address_v6": "0:0:0:0:0:0:0:1",
  "mac_address": "22-00-00-00-00-01",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10001@domain.com",
  "latitude": 37.998119,
  "longitude": 23.819444,
  "speed": "LOW",
  "path_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000002",
  "name": "UE2",
  "description": "This is a UE",
  "gNB_id": 1,
  "Cell_id": 2,
  "ip_address_v4": "10.0.0.2",
  "ip_address_v6": "0:0:0:0:0:0:0:2",
  "mac_address": "22-00-00-00-00-02",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10002@domain.com",
  "latitude": 37.998119,
  "longitude": 23.819444,
  "speed": "LOW",
  "path_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000003",
  "name": "UE3",
  "description": "This is a UE",
  "gNB_id": 1,
  "Cell_id": 3,
  "ip_address_v4": "10.0.0.3",
  "ip_address_v6": "0:0:0:0:0:0:0:3",
  "mac_address": "22-00-00-00-00-03",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10003@domain.com",
  "latitude": 37.996095,
  "longitude": 23.818562,
  "speed": "LOW",
  "path_id": 2
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000004",
  "name": "UE4",
  "description": "This is a UE",
  "gNB_id": 2,
  "Cell_id": 4,
  "ip_address_v4": "10.0.0.4",
  "ip_address_v6": "0:0:0:0:0:0:0:4",
  "mac_address": "22-00-00-00-00-04",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10004@domain.com",
  "latitude": 37.998119,
  "longitude": 23.819444,
  "speed": "LOW",
  "path_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000005",
  "name": "UE5",
  "description": "This is a UE",
  "gNB_id": 2,
  "Cell_id": 5,
  "ip_address_v4": "10.0.0.5",
  "ip_address_v6": "0:0:0:0:0:0:0:5",
  "mac_address": "22-00-00-00-00-05",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10005@domain.com",
  "latitude": 37.998119,
  "longitude": 23.819444,
  "speed": "LOW",
  "path_id": 1
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000006",
  "name": "UE6",
  "description": "This is a UE",
  "gNB_id": 2,
  "Cell_id": 6,
  "ip_address_v4": "10.0.0.6",
  "ip_address_v6": "0:0:0:0:0:0:0:6",
  "mac_address": "22-00-00-00-00-06",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10006@domain.com",
  "latitude": 37.996095,
  "longitude": 23.818562,
  "speed": "LOW",
  "path_id": 2
}'

TOKEN=$(curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/login/access-token" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=&username=simple_user%405g-api-emulator.medianetlab.eu&password=password&scope=&client_id=&client_secret=' \
  | jq -r '.access_token')

echo $TOKEN

#==================================================
echo 'Initiallizing Paths for simple user...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/frontend/location/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
   "description": "NCSRD Central Building", 
   "points": [{"latitude":"37.999262","longitude":"23.819251"},{"latitude":"37.999257","longitude":"23.819260"},{"latitude":"37.999252","longitude":"23.819269"},{"latitude":"37.999246","longitude":"23.819279"},{"latitude":"37.999241","longitude":"23.819288"},{"latitude":"37.999236","longitude":"23.819297"},{"latitude":"37.999230","longitude":"23.819306"},{"latitude":"37.999225","longitude":"23.819315"},{"latitude":"37.999213","longitude":"23.819317"},{"latitude":"37.999205","longitude":"23.819312"},{"latitude":"37.999197","longitude":"23.819307"},{"latitude":"37.999189","longitude":"23.819302"},{"latitude":"37.999181","longitude":"23.819297"},{"latitude":"37.999173","longitude":"23.819292"},{"latitude":"37.999165","longitude":"23.819287"},{"latitude":"37.999156","longitude":"23.819282"},{"latitude":"37.999148","longitude":"23.819277"},{"latitude":"37.999140","longitude":"23.819272"},{"latitude":"37.999132","longitude":"23.819267"},{"latitude":"37.999124","longitude":"23.819262"},{"latitude":"37.999116","longitude":"23.819257"},{"latitude":"37.999108","longitude":"23.819252"},{"latitude":"37.999100","longitude":"23.819247"},{"latitude":"37.999092","longitude":"23.819242"},{"latitude":"37.999084","longitude":"23.819237"},{"latitude":"37.999076","longitude":"23.819232"},{"latitude":"37.999068","longitude":"23.819227"},{"latitude":"37.999059","longitude":"23.819222"},{"latitude":"37.999051","longitude":"23.819217"},{"latitude":"37.999043","longitude":"23.819212"},{"latitude":"37.999035","longitude":"23.819207"},{"latitude":"37.999027","longitude":"23.819202"},{"latitude":"37.999019","longitude":"23.819197"},{"latitude":"37.999011","longitude":"23.819192"},{"latitude":"37.999003","longitude":"23.819187"},{"latitude":"37.998995","longitude":"23.819182"},{"latitude":"37.998987","longitude":"23.819177"},{"latitude":"37.998978","longitude":"23.819185"},{"latitude":"37.998974","longitude":"23.819195"},{"latitude":"37.998969","longitude":"23.819205"},{"latitude":"37.998965","longitude":"23.819215"},{"latitude":"37.998961","longitude":"23.819225"},{"latitude":"37.998957","longitude":"23.819235"},{"latitude":"37.998952","longitude":"23.819245"},{"latitude":"37.998948","longitude":"23.819255"},{"latitude":"37.998944","longitude":"23.819265"},{"latitude":"37.998939","longitude":"23.819275"},{"latitude":"37.998935","longitude":"23.819285"},{"latitude":"37.998931","longitude":"23.819295"},{"latitude":"37.998927","longitude":"23.819305"},{"latitude":"37.998922","longitude":"23.819315"},{"latitude":"37.998918","longitude":"23.819325"},{"latitude":"37.998914","longitude":"23.819335"},{"latitude":"37.998910","longitude":"23.819345"},{"latitude":"37.998905","longitude":"23.819355"},{"latitude":"37.998901","longitude":"23.819365"},{"latitude":"37.998892","longitude":"23.819363"},{"latitude":"37.998884","longitude":"23.819358"},{"latitude":"37.998876","longitude":"23.819353"},{"latitude":"37.998867","longitude":"23.819348"},{"latitude":"37.998859","longitude":"23.819343"},{"latitude":"37.998851","longitude":"23.819338"},{"latitude":"37.998843","longitude":"23.819334"},{"latitude":"37.998835","longitude":"23.819329"},{"latitude":"37.998827","longitude":"23.819324"},{"latitude":"37.998819","longitude":"23.819319"},{"latitude":"37.998811","longitude":"23.819314"},{"latitude":"37.998802","longitude":"23.819309"},{"latitude":"37.998794","longitude":"23.819304"},{"latitude":"37.998786","longitude":"23.819299"},{"latitude":"37.998778","longitude":"23.819294"},{"latitude":"37.998770","longitude":"23.819289"},{"latitude":"37.998762","longitude":"23.819284"},{"latitude":"37.998754","longitude":"23.819280"},{"latitude":"37.998746","longitude":"23.819275"},{"latitude":"37.998738","longitude":"23.819270"},{"latitude":"37.998729","longitude":"23.819265"},{"latitude":"37.998721","longitude":"23.819260"},{"latitude":"37.998713","longitude":"23.819255"},{"latitude":"37.998705","longitude":"23.819250"},{"latitude":"37.998697","longitude":"23.819245"},{"latitude":"37.998689","longitude":"23.819240"},{"latitude":"37.998681","longitude":"23.819235"},{"latitude":"37.998673","longitude":"23.819231"},{"latitude":"37.998664","longitude":"23.819226"},{"latitude":"37.998656","longitude":"23.819221"},{"latitude":"37.998648","longitude":"23.819216"},{"latitude":"37.998640","longitude":"23.819211"},{"latitude":"37.998637","longitude":"23.819197"},{"latitude":"37.998641","longitude":"23.819186"},{"latitude":"37.998645","longitude":"23.819176"},{"latitude":"37.998649","longitude":"23.819166"},{"latitude":"37.998653","longitude":"23.819155"},{"latitude":"37.998657","longitude":"23.819145"},{"latitude":"37.998661","longitude":"23.819135"},{"latitude":"37.998665","longitude":"23.819125"},{"latitude":"37.998668","longitude":"23.819114"},{"latitude":"37.998672","longitude":"23.819104"},{"latitude":"37.998676","longitude":"23.819094"},{"latitude":"37.998680","longitude":"23.819083"},{"latitude":"37.998684","longitude":"23.819073"},{"latitude":"37.998688","longitude":"23.819063"},{"latitude":"37.998692","longitude":"23.819052"},{"latitude":"37.998695","longitude":"23.819042"},{"latitude":"37.998699","longitude":"23.819032"},{"latitude":"37.998703","longitude":"23.819021"},{"latitude":"37.998707","longitude":"23.819011"},{"latitude":"37.998711","longitude":"23.819001"},{"latitude":"37.998715","longitude":"23.818991"},{"latitude":"37.998719","longitude":"23.818980"},{"latitude":"37.998723","longitude":"23.818970"},{"latitude":"37.998726","longitude":"23.818960"},{"latitude":"37.998730","longitude":"23.818949"},{"latitude":"37.998734","longitude":"23.818939"},{"latitude":"37.998738","longitude":"23.818929"},{"latitude":"37.998742","longitude":"23.818918"},{"latitude":"37.998746","longitude":"23.818908"},{"latitude":"37.998750","longitude":"23.818898"},{"latitude":"37.998753","longitude":"23.818888"},{"latitude":"37.998757","longitude":"23.818877"},{"latitude":"37.998761","longitude":"23.818867"},{"latitude":"37.998765","longitude":"23.818857"},{"latitude":"37.998769","longitude":"23.818846"},{"latitude":"37.998773","longitude":"23.818836"},{"latitude":"37.998777","longitude":"23.818826"},{"latitude":"37.998781","longitude":"23.818815"},{"latitude":"37.998784","longitude":"23.818805"},{"latitude":"37.998788","longitude":"23.818795"},{"latitude":"37.998792","longitude":"23.818784"},{"latitude":"37.998796","longitude":"23.818774"},{"latitude":"37.998800","longitude":"23.818764"},{"latitude":"37.998804","longitude":"23.818754"},{"latitude":"37.998808","longitude":"23.818743"},{"latitude":"37.998811","longitude":"23.818733"},{"latitude":"37.998815","longitude":"23.818723"},{"latitude":"37.998819","longitude":"23.818712"},{"latitude":"37.998823","longitude":"23.818702"},{"latitude":"37.998827","longitude":"23.818692"},{"latitude":"37.998831","longitude":"23.818681"},{"latitude":"37.998835","longitude":"23.818671"},{"latitude":"37.998839","longitude":"23.818661"},{"latitude":"37.998842","longitude":"23.818651"},{"latitude":"37.998846","longitude":"23.818640"},{"latitude":"37.998850","longitude":"23.818630"},{"latitude":"37.998854","longitude":"23.818620"},{"latitude":"37.998858","longitude":"23.818609"},{"latitude":"37.998862","longitude":"23.818599"},{"latitude":"37.998866","longitude":"23.818589"},{"latitude":"37.998874","longitude":"23.818593"},{"latitude":"37.998882","longitude":"23.818599"},{"latitude":"37.998890","longitude":"23.818604"},{"latitude":"37.998897","longitude":"23.818610"},{"latitude":"37.998905","longitude":"23.818615"},{"latitude":"37.998913","longitude":"23.818621"},{"latitude":"37.998921","longitude":"23.818626"},{"latitude":"37.998929","longitude":"23.818632"},{"latitude":"37.998937","longitude":"23.818638"},{"latitude":"37.998945","longitude":"23.818643"},{"latitude":"37.998952","longitude":"23.818649"},{"latitude":"37.998960","longitude":"23.818654"},{"latitude":"37.998968","longitude":"23.818660"},{"latitude":"37.998976","longitude":"23.818665"},{"latitude":"37.998984","longitude":"23.818671"},{"latitude":"37.998992","longitude":"23.818677"},{"latitude":"37.998999","longitude":"23.818682"},{"latitude":"37.999007","longitude":"23.818688"},{"latitude":"37.999015","longitude":"23.818693"},{"latitude":"37.999023","longitude":"23.818699"},{"latitude":"37.999031","longitude":"23.818705"},{"latitude":"37.999039","longitude":"23.818710"},{"latitude":"37.999047","longitude":"23.818716"},{"latitude":"37.999054","longitude":"23.818721"},{"latitude":"37.999062","longitude":"23.818727"},{"latitude":"37.999070","longitude":"23.818732"},{"latitude":"37.999078","longitude":"23.818738"},{"latitude":"37.999086","longitude":"23.818744"},{"latitude":"37.999094","longitude":"23.818749"},{"latitude":"37.999101","longitude":"23.818755"},{"latitude":"37.999109","longitude":"23.818760"},{"latitude":"37.999117","longitude":"23.818766"},{"latitude":"37.999125","longitude":"23.818771"},{"latitude":"37.999133","longitude":"23.818777"},{"latitude":"37.999141","longitude":"23.818783"},{"latitude":"37.999149","longitude":"23.818788"},{"latitude":"37.999156","longitude":"23.818794"},{"latitude":"37.999164","longitude":"23.818799"},{"latitude":"37.999172","longitude":"23.818805"},{"latitude":"37.999180","longitude":"23.818811"},{"latitude":"37.999188","longitude":"23.818816"},{"latitude":"37.999196","longitude":"23.818822"},{"latitude":"37.999203","longitude":"23.818827"},{"latitude":"37.999211","longitude":"23.818833"},{"latitude":"37.999219","longitude":"23.818838"},{"latitude":"37.999227","longitude":"23.818844"},{"latitude":"37.999235","longitude":"23.818850"},{"latitude":"37.999243","longitude":"23.818855"},{"latitude":"37.999250","longitude":"23.818861"},{"latitude":"37.999258","longitude":"23.818866"},{"latitude":"37.999266","longitude":"23.818872"},{"latitude":"37.999274","longitude":"23.818877"},{"latitude":"37.999282","longitude":"23.818883"},{"latitude":"37.999290","longitude":"23.818889"},{"latitude":"37.999298","longitude":"23.818894"},{"latitude":"37.999299","longitude":"23.818909"},{"latitude":"37.999295","longitude":"23.818919"},{"latitude":"37.999291","longitude":"23.818929"},{"latitude":"37.999287","longitude":"23.818939"},{"latitude":"37.999283","longitude":"23.818949"},{"latitude":"37.999279","longitude":"23.818959"},{"latitude":"37.999275","longitude":"23.818969"},{"latitude":"37.999271","longitude":"23.818980"},{"latitude":"37.999266","longitude":"23.818990"},{"latitude":"37.999262","longitude":"23.819000"},{"latitude":"37.999258","longitude":"23.819010"},{"latitude":"37.999254","longitude":"23.819020"},{"latitude":"37.999250","longitude":"23.819030"},{"latitude":"37.999246","longitude":"23.819040"},{"latitude":"37.999242","longitude":"23.819051"},{"latitude":"37.999238","longitude":"23.819061"},{"latitude":"37.999233","longitude":"23.819071"},{"latitude":"37.999229","longitude":"23.819081"},{"latitude":"37.999225","longitude":"23.819091"},{"latitude":"37.999221","longitude":"23.819101"},{"latitude":"37.999217","longitude":"23.819111"},{"latitude":"37.999213","longitude":"23.819122"},{"latitude":"37.999209","longitude":"23.819132"},{"latitude":"37.999214","longitude":"23.819143"},{"latitude":"37.999222","longitude":"23.819148"},{"latitude":"37.999230","longitude":"23.819154"},{"latitude":"37.999238","longitude":"23.819159"},{"latitude":"37.999246","longitude":"23.819165"},{"latitude":"37.999253","longitude":"23.819171"},{"latitude":"37.999261","longitude":"23.819176"},{"latitude":"37.999269","longitude":"23.819182"},{"latitude":"37.999277","longitude":"23.819187"},{"latitude":"37.999277","longitude":"23.819199"},{"latitude":"37.999276","longitude":"23.819211"},{"latitude":"37.999274","longitude":"23.819222"}],
   "start_point": {
    "latitude": 37.999262,
    "longitude": 23.819251
  },
  "end_point": {
    "latitude": 37.999274,
    "longitude": 23.819222
  },
  "color": "pink"
}'
echo 'Initiallizing gNBs for simple user...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/gNBs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "gNB_id": "ABAAA1",
  "name": "gNB1",
  "description": "This is a base station",
  "location": "unknown"
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/gNBs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "gNB_id": "ABAAA2",
  "name": "gNB2",
  "description": "This is a base station",
  "location": "unknown"
}'

echo 'Initiallizing Cells for simple user...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA1001",
  "name": "cell1",
  "description": "This is a cell",
  "gNB_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA1002",
  "name": "cell2",
  "description": "This is a cell",
  "gNB_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA1003",
  "name": "cell3",
  "description": "This is a cell",
  "gNB_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA2001",
  "name": "cell4",
  "description": "This is a cell",
  "gNB_id": 4
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA2002",
  "name": "cell5",
  "description": "This is a cell",
  "gNB_id": 4
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/Cells/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "cell_id": "ABAAA2003",
  "name": "cell6",
  "description": "This is a cell",
  "gNB_id": 4
}'

echo 'Initiallizing UEs for simple user...'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000011",
  "name": "UE1",
  "description": "This is a UE",
  "gNB_id": 3,
  "Cell_id": 7,
  "ip_address_v4": "10.0.0.11",
  "ip_address_v6": "0:0:0:0:0:0:0:11",
  "mac_address": "22-00-00-00-00-11",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10011@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000012",
  "name": "UE2",
  "description": "This is a UE",
  "gNB_id": 3,
  "Cell_id": 8,
  "ip_address_v4": "10.0.0.12",
  "ip_address_v6": "0:0:0:0:0:0:0:12",
  "mac_address": "22-00-00-00-00-12",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10012@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000013",
  "name": "UE3",
  "description": "This is a UE",
  "gNB_id": 3,
  "Cell_id": 9,
  "ip_address_v4": "10.0.0.13",
  "ip_address_v6": "0:0:0:0:0:0:0:13",
  "mac_address": "22-00-00-00-00-13",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10013@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000014",
  "name": "UE4",
  "description": "This is a UE",
  "gNB_id": 4,
  "Cell_id": 10,
  "ip_address_v4": "10.0.0.14",
  "ip_address_v6": "0:0:0:0:0:0:0:14",
  "mac_address": "22-00-00-00-00-14",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10014@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000015",
  "name": "UE5",
  "description": "This is a UE",
  "gNB_id": 4,
  "Cell_id": 11,
  "ip_address_v4": "10.0.0.15",
  "ip_address_v6": "0:0:0:0:0:0:0:15",
  "mac_address": "22-00-00-00-00-15",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10015@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'

curl -X 'POST' \
  "http://localhost:${PORT}/api/v1/UEs/" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
  "supi": "202010000000016",
  "name": "UE6",
  "description": "This is a UE",
  "gNB_id": 4,
  "Cell_id": 12,
  "ip_address_v4": "10.0.0.16",
  "ip_address_v6": "0:0:0:0:0:0:0:16",
  "mac_address": "22-00-00-00-00-16",
  "dnn": "province1.mnc01.mcc202.gprs",
  "mcc": 202,
  "mnc": 1,
  "external_identifier": "10016@domain.com",
  "latitude": 37.999262,
  "longitude": 23.819251,
  "speed": "LOW",
  "path_id": 3
}'