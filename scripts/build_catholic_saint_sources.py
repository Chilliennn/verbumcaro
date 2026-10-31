# scripts/build_catholic_saint_sources.py
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Mapping each canonical saint entity to an authoritative, non-Wikipedia Catholic story URL
# Sources used: New Advent Catholic Encyclopedia (cathen), Vatican.va (Holy See liturgical biographies),
# and official Catholic sanctuaries / diocesan causes.
CATHOLIC_SAINT_URLS = {
    "Agnes_of_Assisi": "https://www.newadvent.org/cathen/01214a.htm",
    "Aloysius_Gonzaga": "https://www.newadvent.org/cathen/01331c.htm",
    "Alphonsa_of_the_Immaculate_Conception": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20081012_alphonsa_en.html",
    "Alphonsus_Liguori": "https://www.newadvent.org/cathen/01334a.htm",
    "Ambrose": "https://www.newadvent.org/cathen/01383c.htm",
    "Angela_Merici": "https://www.newadvent.org/cathen/01481a.htm",
    "Anna_Schäffer": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20121021_anna-schaffer_en.html",
    "Anthony_Maria_Zaccaria": "https://www.newadvent.org/cathen/01588b.htm",
    "Anthony_of_Padua": "https://www.newadvent.org/cathen/01556a.htm",
    "Anthony_the_Great": "https://www.newadvent.org/cathen/01553d.htm",
    "Augustine_of_Hippo": "https://www.newadvent.org/cathen/02084a.htm",
    "Basil_of_Caesarea": "https://www.newadvent.org/cathen/02330b.htm",
    "Benedict_of_Nursia": "https://www.newadvent.org/cathen/02441a.htm",
    "Bernadette_Soubirous": "https://www.newadvent.org/cathen/02500a.htm",
    "Bernardino_of_Siena": "https://www.newadvent.org/cathen/02505b.htm",
    "Bernard_of_Clairvaux": "https://www.newadvent.org/cathen/02498d.htm",
    "Bonaventure": "https://www.newadvent.org/cathen/02648c.htm",
    "Bridget_of_Sweden": "https://www.newadvent.org/cathen/02782a.htm",
    "Carlo_Acutis": "https://www.vaticannews.va/en/church/news/2020-10/carlo-acutis-blessed-assisi-eucharist-patron-internet.html",
    "Catherine_of_Genoa": "https://www.newadvent.org/cathen/03446b.htm",
    "Catherine_of_Siena": "https://www.newadvent.org/cathen/03447a.htm",
    "Charles_Borromeo": "https://www.newadvent.org/cathen/03619a.htm",
    "Clare_of_Assisi": "https://www.newadvent.org/cathen/04004a.htm",
    "Colette_of_Corbie": "https://www.newadvent.org/cathen/04096a.htm",
    "Dominic_Savio": "https://www.catholic.org/saints/saint.php?saint_id=43",
    "Dorotheus_of_Gaza": "https://www.newadvent.org/cathen/05135b.htm",
    "Edith_Stein": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_19981011_edith_stein_en.html",
    "Elizabeth_(biblical_figure)": "https://www.newadvent.org/cathen/05387b.htm",
    "Elizabeth_Ann_Seton": "https://www.newadvent.org/cathen/13739a.htm",
    "Elizabeth_Hesselblad": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20160605_hesselblad_en.html",
    "Elizabeth_of_Hungary": "https://www.newadvent.org/cathen/05389a.htm",
    "Elizabeth_of_the_Trinity": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20161016_elisabetta-trinita_en.html",
    "Emily_de_Vialar": "https://www.newadvent.org/cathen/05404b.htm",
    "Ephrem_the_Syrian": "https://www.newadvent.org/cathen/05498a.htm",
    "Euphrasia_Eluvathingal": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20141123_eufrasia-eluvathingal_en.html",
    "Faustina_Kowalska": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000430_faustina_en.html",
    "Frances_Xavier_Cabrini": "https://www.catholic.org/saints/saint.php?saint_id=278",
    "Francis_Xavier": "https://www.newadvent.org/cathen/06233b.htm",
    "Francis_de_Sales": "https://www.newadvent.org/cathen/06220a.htm",
    "Francis_of_Assisi": "https://www.newadvent.org/cathen/06221a.htm",
    "Gabriel_of_Our_Lady_of_Sorrows": "https://www.newadvent.org/cathen/06330b.htm",
    "Gemma_Galgani": "https://www.catholic.org/saints/saint.php?saint_id=40",
    "Genoveva_Torres_Morales": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20030504_torres-morales_en.html",
    "Gerard_Majella": "https://www.newadvent.org/cathen/06468a.htm",
    "Gianna_Beretta_Molla": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20040516_beretta-molla_en.html",
    "Giuditta_Vannini": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20191013_giuseppina-vannini_en.html",
    "Hilary_of_Poitiers": "https://www.newadvent.org/cathen/07349b.htm",
    "Hildegard_of_Bingen": "https://www.newadvent.org/cathen/07351a.htm",
    "Ignatius_of_Loyola": "https://www.newadvent.org/cathen/07639c.htm",
    "Irmã_Dulce_Pontes": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20191013_dulce-lopes_en.html",
    "Isidore_of_Seville": "https://www.newadvent.org/cathen/08186a.htm",
    "Jacinta_and_Francisco_Marto": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000513_francesco-giacinta-marto_en.html",
    "Jacopone_da_Todi": "https://www.newadvent.org/cathen/08263a.htm",
    "Jane_Frances_de_Chantal": "https://www.newadvent.org/cathen/08271a.htm",
    "Jean-Baptiste_de_La_Salle": "https://www.newadvent.org/cathen/08444a.htm",
    "Jerome": "https://www.newadvent.org/cathen/08341a.htm",
    "Joan_of_Arc": "https://www.newadvent.org/cathen/08409c.htm",
    "John_Bosco": "https://www.newadvent.org/cathen/02689d.htm",
    "John_Chrysostom": "https://www.newadvent.org/cathen/08452b.htm",
    "John_Vianney": "https://www.newadvent.org/cathen/08326c.htm",
    "John_of_God": "https://www.newadvent.org/cathen/08472c.htm",
    "John_of_the_Cross": "https://www.newadvent.org/cathen/08480a.htm",
    "John_the_Baptist": "https://www.newadvent.org/cathen/08486b.htm",
    "José_Sánchez_del_Río": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20161016_sanchez-del-rio_en.html",
    "Josemaría_Escrivá": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20021006_index_escriva_en.html",
    "Joseph_of_Cupertino": "https://www.newadvent.org/cathen/08520b.htm",
    "Josephine_Bakhita": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20001001_bakhita_en.html",
    "Junípero_Serra": "https://www.newadvent.org/cathen/13730b.htm",
    "Jutta_of_Kulmsee": "https://www.catholic.org/saints/saint.php?saint_id=4087",
    "Kateri_Tekakwitha": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20121021_kateri-tekakwitha_en.html",
    "Katharine_Drexel": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20001001_drexel_en.html",
    "Laura_of_Saint_Catherine_of_Siena": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20130512_laura-montoya_en.html",
    "Louis_IX_of_France": "https://www.newadvent.org/cathen/09368a.htm",
    "Louis_de_Montfort": "https://www.newadvent.org/cathen/09384a.htm",
    "Maravillas_de_Jesús": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20030504_maravillas-jesus_en.html",
    "Margaret_Mary_Alacoque": "https://www.newadvent.org/cathen/09653a.htm",
    "Margaret_of_Cortona": "https://www.newadvent.org/cathen/09653c.htm",
    "Mariam_Thresia_Chiramel": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20191013_mariam-thresia_en.html",
    "Marianne_Cope": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20121021_marianne-cope_en.html",
    "Martin_of_Tours": "https://www.newadvent.org/cathen/09732b.htm",
    "Mary_MacKillop": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20101017_mackillop_en.html",
    "Maximilian_Kolbe": "https://www.catholic.org/saints/saint.php?saint_id=370",
    "Miguel_Pro": "https://www.catholic.org/saints/saint.php?saint_id=508",
    "Mother_Teresa": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20031019_madre-teresa_en.html",
    "María_Natividad_Venegas_de_la_Torre": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000521_venegas-torre_en.html",
    "Padre_Pio": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020616_padre-pio_en.html",
    "Paul_Miki": "https://www.newadvent.org/cathen/08344b.htm",
    "Paul_of_the_Cross": "https://www.newadvent.org/cathen/11590a.htm",
    "Paula_Frassinetti": "https://www.catholic.org/saints/saint.php?saint_id=5250",
    "Peter_Claver": "https://www.newadvent.org/cathen/11763a.htm",
    "Peter_Damian": "https://www.newadvent.org/cathen/11764a.htm",
    "Philip_Neri": "https://www.newadvent.org/cathen/12018b.htm",
    "Pier_Giorgio_Frassati": "https://frassatiusa.org/biography",
    "Pope_John_Paul_II": "https://www.vatican.va/content/john-paul-ii/en/biography/documents/hf_jp-ii_bio_01062007_biography.html",
    "Pope_John_XXIII": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000903_john-xxiii_en.html",
    "Pope_Leo_I": "https://www.newadvent.org/cathen/09154b.htm",
    "Pope_Paul_VI": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20141019_paolo-vi_en.html",
    "Pope_Pius_X": "https://www.newadvent.org/cathen/12137a.htm",
    "Robert_Bellarmine": "https://www.newadvent.org/cathen/02392b.htm",
    "Rose_Philippine_Duchesne": "https://www.newadvent.org/cathen/05188a.htm",
    "Rose_of_Lima": "https://www.newadvent.org/cathen/13192c.htm",
    "Rose_of_Viterbo": "https://www.newadvent.org/cathen/13193a.htm",
    "Saint_Agatha": "https://www.newadvent.org/cathen/01203c.htm",
    "Saint_Agnes": "https://www.newadvent.org/cathen/01224a.htm",
    "Saint_Dominic": "https://www.newadvent.org/cathen/05106a.htm",
    "Saint_Lucy": "https://www.newadvent.org/cathen/09414a.htm",
    "Saint_Monica": "https://www.newadvent.org/cathen/10482a.htm",
    "Saint_Nicholas": "https://www.newadvent.org/cathen/11063b.htm",
    "Saint_Patrick": "https://www.newadvent.org/cathen/11554a.htm",
    "Saint_Sebastian": "https://www.newadvent.org/cathen/13668b.htm",
    "Scholastica": "https://www.newadvent.org/cathen/13547a.htm",
    "Solanus_Casey": "https://www.solanuscasey.org/about-us/the-life-of-blessed-solanus-casey/",
    "Teresa_of_Ávila": "https://www.newadvent.org/cathen/14515b.htm",
    "Thomas_Aquinas": "https://www.newadvent.org/cathen/14663b.htm",
    "Thomas_Becket": "https://www.newadvent.org/cathen/14676a.htm",
    "Thomas_More": "https://www.newadvent.org/cathen/14689c.htm",
    "Théophane_Vénard": "https://www.newadvent.org/cathen/15329b.htm",
    "Thérèse_of_Lisieux": "https://www.newadvent.org/cathen/17721a.htm",
    "Ursula_Ledóchowska": "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20030518_ledochowska_en.html",
    "Vincent_Ferrer": "https://www.newadvent.org/cathen/15437a.htm",
    "Vincent_de_Paul": "https://www.newadvent.org/cathen/15434c.htm",
    "Zita": "https://www.newadvent.org/cathen/15762a.htm",
    "Maria_Goretti": "https://www.newadvent.org/cathen/16043a.htm"
}

def verify_all():
    print(f"Testing {len(CATHOLIC_SAINT_URLS)} non-Wikipedia Catholic saint URLs...")
    def check_url(item):
        title, url = item
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "VerbumCaro/1.0 (Mozilla/5.0)"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                return title, url, resp.status
        except Exception as e:
            return title, url, str(e)

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(check_url, CATHOLIC_SAINT_URLS.items()))

    errors = [r for r in results if r[2] != 200]
    print(f"Total tested: {len(results)}, Succeeded: {len(results) - len(errors)}, Errors: {len(errors)}")
    if errors:
        for title, url, err in errors:
            print(f"FAILED {title}: {url} -> {err}")
    return len(errors) == 0

if __name__ == "__main__":
    verify_all()
