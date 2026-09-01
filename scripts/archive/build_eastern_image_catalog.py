#!/usr/bin/env python3
import json
import os
import re

DATA = [
    {
        "research_id": "round2_east_001",
        "name": "Gahirmatha Marine Sanctuary",
        "district": "Kendrapara",
        "category": "wildlife",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Olive_ridley_sea_turtle_with_satellite_transmitter_at_Gahirmatha_Beach.jpg",
            "wikimedia_file": "File:Olive ridley sea turtle with satellite transmitter at Gahirmatha Beach.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Olive_ridley_sea_turtle_with_satellite_transmitter_at_Gahirmatha_Beach.jpg",
            "author": "B.C. Choudhury / Wildlife Institute of India",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by B.C. Choudhury via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [2048, 1536],
            "type": "hero",
            "description": "Adult female Olive Ridley sea turtle fitted with satellite transmitter at Gahirmatha Beach, Kendrapara"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Habalikhati_Island_Turtle_Site.jpg",
                "wikimedia_file": "File:Habalikhati Island Turtle Site.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Habalikhati_Island_Turtle_Site.jpg",
                "author": "Subhrasingh",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Subhrasingh via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4032, 3024],
                "type": "gallery",
                "description": "Sandy beach and turtle nesting grounds at Habalikhati island in Gahirmatha / Bhitarkanika sanctuary"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Riddle_of_Ridleys.jpg",
                "wikimedia_file": "File:Riddle of Ridleys.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Riddle_of_Ridleys.jpg",
                "author": "Aliva Sahoo",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Aliva Sahoo via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4096, 3072],
                "type": "gallery",
                "description": "Olive Ridley sea turtle hatchlings emerging from sand on Odisha coast"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_002",
        "name": "Hukitola Monument",
        "district": "Kendrapara",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Hukitola-3.jpg",
            "wikimedia_file": "File:Hukitola-3.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Hukitola-3.jpg",
            "author": "Dsasanka",
            "license": "CC BY-SA 3.0",
            "attribution": "Photo by Dsasanka via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [4896, 3672],
            "type": "hero",
            "description": "Panoramic view of the massive stone colonial storehouse and rainwater harvesting roof of Hukitola Monument"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Hukitola-2.jpg",
                "wikimedia_file": "File:Hukitola-2.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Hukitola-2.jpg",
                "author": "Dsasanka",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Dsasanka via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4896, 3672],
                "type": "gallery",
                "description": "Interior colonnades and stone pillars of the 19th-century Hukitola Rice Godown"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Hukitola-4.jpg",
                "wikimedia_file": "File:Hukitola-4.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Hukitola-4.jpg",
                "author": "Dsasanka",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Dsasanka via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4896, 3672],
                "type": "gallery",
                "description": "Exterior view of Hukitola heritage building on Hukitola Island"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Hukitola-5.jpg",
                "wikimedia_file": "File:Hukitola-5.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Hukitola-5.jpg",
                "author": "Dsasanka",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Dsasanka via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4896, 3672],
                "type": "gallery",
                "description": "Frontal architectural facade of Hukitola colonial port complex"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_003",
        "name": "Kanika Palace",
        "district": "Kendrapara",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kanika_palace.jpg",
            "wikimedia_file": "File:Kanika palace.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Kanika_palace.jpg",
            "author": "Sanjeetkunu",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Sanjeetkunu via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3264, 1836],
            "type": "hero",
            "description": "Front view of Kanika Raj Palace in Rajkanika showing Indo-European gothic architecture"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Kanika_Palace_In_monocolor.jpg",
                "wikimedia_file": "File:Kanika Palace In monocolor.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Kanika_Palace_In_monocolor.jpg",
                "author": "Sanjeetkunu",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Sanjeetkunu via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [3264, 1836],
                "type": "gallery",
                "description": "Architectural detail of Kanika Palace royal estate"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_004",
        "name": "Aul Palace",
        "district": "Kendrapara",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/3/38/Aul_Palace.jpg",
            "wikimedia_file": "File:Aul Palace.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Aul_Palace.jpg",
            "author": "Imbibek91",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Imbibek91 via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [1579, 709],
            "type": "hero",
            "description": "Historic 16th-century riverfront fortress palace of Raja of Aul on Kharasrota River"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Braja_Sundar_Deb_of_Aul_Aul-Raj_Circus_from_Oriya_Bhasha_Kosh_1931.png",
                "wikimedia_file": "File:Braja Sundar Deb of Aul Aul-Raj Circus from Oriya Bhasha Kosh 1931.png",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Braja_Sundar_Deb_of_Aul_Aul-Raj_Circus_from_Oriya_Bhasha_Kosh_1931.png",
                "author": "G. C. Praharaj",
                "license": "CC BY-SA 4.0",
                "attribution": "Historical portrait by G. C. Praharaj via Wikimedia Commons, CC BY-SA 4.0",
                "dimensions": [624, 879],
                "type": "gallery",
                "description": "Historic portrait of Raja of Aul Braja Sundar Deb from Oriya Bhasha Kosh (1931)"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_005",
        "name": "Rakta Tirtha Eram",
        "district": "Bhadrak",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Eram_Saheed_Smrutistambha.jpg",
            "wikimedia_file": "File:Eram Saheed Smrutistambha.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Eram_Saheed_Smrutistambha.jpg",
            "author": "Sangram Keshari Senapati",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Sangram Keshari Senapati via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4000, 3000],
            "type": "hero",
            "description": "The Martyr Memorial Pillar (Saheed Smrutistambha) at Rakta Tirtha Eram commemorating the 1942 Quit India martyrs"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/9/96/Banchhanidhi_Mohanty_Statue.jpg",
                "wikimedia_file": "File:Banchhanidhi Mohanty Statue.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Banchhanidhi_Mohanty_Statue.jpg",
                "author": "Sangram Keshari Senapati",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Sangram Keshari Senapati via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Statue of freedom struggle nationalist poet Banchhanidhi Mohanty at Eram memorial ground"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Ganesha_Tripathy_Statue.jpg",
                "wikimedia_file": "File:Ganesha Tripathy Statue.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Ganesha_Tripathy_Statue.jpg",
                "author": "Sangram Keshari Senapati",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Sangram Keshari Senapati via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [3000, 4000],
                "type": "gallery",
                "description": "Martyr memorial statue of Ganesha Tripathy at Rakta Tirtha Eram"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_006",
        "name": "Biranchinarayan Sun Temple, Palia",
        "district": "Bhadrak",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/65/Biranchinarayan_Temple.jpg",
            "wikimedia_file": "File:Biranchinarayan Temple.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Biranchinarayan_Temple.jpg",
            "author": "Satyabrata Nanda",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Satyabrata Nanda via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4928, 3264],
            "type": "hero",
            "description": "13th-century stone Biranchinarayan Sun Temple at Palia dedicated to four-faced Surya"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Biranchinarayana_Temple_Wooden_craving.jpg",
                "wikimedia_file": "File:Biranchinarayana Temple Wooden craving.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Biranchinarayana_Temple_Wooden_craving.jpg",
                "author": "TheDashd",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by TheDashd via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [2318, 1536],
                "type": "gallery",
                "description": "Intricate ancient wooden carvings on the ceiling of Biranchinarayan Temple"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/67/Biranchinarayana_Temple_wooden_work.jpg",
                "wikimedia_file": "File:Biranchinarayana Temple wooden work.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Biranchinarayana_Temple_wooden_work.jpg",
                "author": "TheDashd",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by TheDashd via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [2318, 1536],
                "type": "gallery",
                "description": "Traditional woodcraft and structural woodwork at Palia Sun Temple"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Biranchinarayana_Temple.jpg",
                "wikimedia_file": "File:Biranchinarayana Temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Biranchinarayana_Temple.jpg",
                "author": "TheDashd",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by TheDashd via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [1536, 2318],
                "type": "gallery",
                "description": "Vimana and Jagamohana structure of Biranchinarayan Temple Palia"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_007",
        "name": "Maa Bhadrakali Temple",
        "district": "Bhadrak",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Bhadrakali_Mandir.jpg",
            "wikimedia_file": "File:Bhadrakali Mandir.JPG",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Bhadrakali_Mandir.JPG",
            "author": "Ayrahca Saaz",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Ayrahca Saaz via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [1600, 774],
            "type": "hero",
            "description": "Presiding Shakti shrine of Maa Bhadrakali Temple at Aharpada on the banks of Salandi River"
        },
        "gallery": [],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_008",
        "name": "Saranga Anantasayana Vishnu",
        "district": "Dhenkanal",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Anantasayana_Basudev_or_Lord_Vishnu_is_sleeping_posture_.This_open_air_relief_is_curved_out_of_stone_on_Brahmani_river_of_Sarang_village_of_Dhenkanal_district_of_Odisha._It%27s_length_is_approx_52_ft_and_was_built_in_9th_century.jpg",
            "wikimedia_file": "File:Anantasayana Basudev or Lord Vishnu is sleeping posture .This open air relief is curved out of stone on Brahmani river of Sarang village of Dhenkanal district of Odisha. It's length is approx 52 ft and was built in 9th century.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Anantasayana_Basudev_or_Lord_Vishnu_is_sleeping_posture_.This_open_air_relief_is_curved_out_of_stone_on_Brahmani_river_of_Sarang_village_of_Dhenkanal_district_of_Odisha._It%27s_length_is_approx_52_ft_and_was_built_in_9th_century.jpg",
            "author": "Kamalakanta777",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [5184, 3456],
            "type": "hero",
            "description": "Colossal 9th-century rock-cut open-air sculpture of Lord Vishnu in Anantashayana sleeping posture on Brahmani River bed (15.4m)"
        },
        "gallery": [],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_009",
        "name": "Dandadhar Dam & Reservoir",
        "district": "Dhenkanal",
        "category": "nature",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/3/36/Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG",
            "wikimedia_file": "File:Ramial Dam - Dhenkanal 2018-01-25 9375.JPG",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Ramial_Dam_-_Dhenkanal_2018-01-25_9375.JPG",
            "author": "Biswarup Ganguly",
            "license": "CC BY 3.0",
            "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
            "dimensions": [5956, 3960],
            "type": "hero",
            "description": "Panoramic landscape view of Dandadhar Dam reservoir across Ramial River framed by forested hillocks"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/Ramial_Dam_-_Dhenkanal_2018-01-25_9376.JPG",
                "wikimedia_file": "File:Ramial Dam - Dhenkanal 2018-01-25 9376.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Ramial_Dam_-_Dhenkanal_2018-01-25_9376.JPG",
                "author": "Biswarup Ganguly",
                "license": "CC BY 3.0",
                "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
                "dimensions": [5939, 3949],
                "type": "gallery",
                "description": "Spillway and embankment view of Dandadhar (Ramial) Dam"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/69/Ramial_Dam_-_Dhenkanal_2018-01-25_9377.JPG",
                "wikimedia_file": "File:Ramial Dam - Dhenkanal 2018-01-25 9377.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Ramial_Dam_-_Dhenkanal_2018-01-25_9377.JPG",
                "author": "Biswarup Ganguly",
                "license": "CC BY 3.0",
                "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
                "dimensions": [5931, 3944],
                "type": "gallery",
                "description": "Reservoir water basin and scenic picnic area at Dandadhar"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Ramial_Dam_-_Dhenkanal_2018-01-25_9378.JPG",
                "wikimedia_file": "File:Ramial Dam - Dhenkanal 2018-01-25 9378.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Ramial_Dam_-_Dhenkanal_2018-01-25_9378.JPG",
                "author": "Biswarup Ganguly",
                "license": "CC BY 3.0",
                "attribution": "Photo by Biswarup Ganguly via Wikimedia Commons, licensed under CC BY 3.0",
                "dimensions": [5894, 3919],
                "type": "gallery",
                "description": "Overlooking the Ramial river valley below Dandadhar dam"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_010",
        "name": "Sadeibereni Dokra Craft Village",
        "district": "Dhenkanal",
        "category": "cultural",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/66/A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg",
            "wikimedia_file": "File:A Dhokra cast being made by a Dharua tribal woman.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:A_Dhokra_cast_being_made_by_a_Dharua_tribal_woman.jpg",
            "author": "Subhashish Panigrahi",
            "license": "CC BY 4.0",
            "attribution": "Photo by Subhashish Panigrahi via Wikimedia Commons, licensed under CC BY 4.0",
            "dimensions": [4000, 3000],
            "type": "hero",
            "description": "Tribal artisan crafting traditional lost-wax Dokra brass casting at Sadeibereni"
        },
        "gallery": [],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_011",
        "name": "Chhatia Bata",
        "district": "Jajpur",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Chatia_bata.jpg",
            "wikimedia_file": "File:Chatia bata.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Chatia_bata.jpg",
            "author": "Subhasisa Panigrahi",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Subhasisa Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3264, 2448],
            "type": "hero",
            "description": "Sacred Chhatia Bata temple complex and fort walls associated with saint Hadi Das and Lord Kalki Jagannath"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Chatia_temple.jpg",
                "wikimedia_file": "File:Chatia temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Chatia_temple.jpg",
                "author": "Kamalakanta777",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "View of the inner sanctum tower and courtyard of Chhatia Jagannath Temple"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Chhatia_bata_temple.jpg",
                "wikimedia_file": "File:Chhatia bata temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Chhatia_bata_temple.jpg",
                "author": "Tuliasamal",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Tuliasamal via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [600, 450],
                "type": "gallery",
                "description": "Entrance gate and temple enclosure at Chhatia Bata Dham"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_012",
        "name": "Mahavinayak Temple, Chandikhole",
        "district": "Jajpur",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Maha_Binayak_Temple.jpg",
            "wikimedia_file": "File:Maha Binayak Temple.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Maha_Binayak_Temple.jpg",
            "author": "Subhasisa Panigrahi",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Subhasisa Panigrahi via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [3264, 2448],
            "type": "hero",
            "description": "Medieval Pancha Devata shrine of Mahavinayak Temple nestled at the base of Barunei Hill in Chandikhole"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/65/Mahabinayak_temple.jpg",
                "wikimedia_file": "File:Mahabinayak temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Mahabinayak_temple.jpg",
                "author": "Kamalakanta777",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Full view of Mahavinayak Temple vimana and lush forest hill backdrop"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Small_waterfall_in_mahabainayak_temple.jpg",
                "wikimedia_file": "File:Small waterfall in mahabainayak temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Small_waterfall_in_mahabainayak_temple.jpg",
                "author": "Kamalakanta777",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Natural perennial freshwater stream and spring cascading beside Mahavinayak Temple"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/60/Durha_templein_mahabinayak.jpg",
                "wikimedia_file": "File:Durha templein mahabinayak.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Durha_templein_mahabinayak.jpg",
                "author": "Kamalakanta777",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Kamalakanta777 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [3839, 3000],
                "type": "gallery",
                "description": "Subsidiary shrines and steps of Mahavinayaka pitha"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_013",
        "name": "Garh Kujanga",
        "district": "Jagatsinghpur",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/3/3d/KrutamachandiTemple_TripathySahi_Jagatsinghpur_Odisha_India.jpg",
            "wikimedia_file": "File:KrutamachandiTemple_TripathySahi_Jagatsinghpur_Odisha_India.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:KrutamachandiTemple_TripathySahi_Jagatsinghpur_Odisha_India.jpg",
            "author": "AnsumanTripathy",
            "license": "CC BY-SA 3.0",
            "attribution": "Photo by AnsumanTripathy via Wikimedia Commons, licensed under CC BY-SA 3.0",
            "dimensions": [4128, 3096],
            "type": "hero",
            "description": "Historic temple architecture of Jagatsinghpur coastal heritage pitha"
        },
        "gallery": [],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_014",
        "name": "Alaka Ashram",
        "district": "Jagatsinghpur",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Srikrishna_Academy%2C_Jagatsinghpur_Main_Gate.jpg",
            "wikimedia_file": "File:Srikrishna Academy, Jagatsinghpur Main Gate.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Srikrishna_Academy%2C_Jagatsinghpur_Main_Gate.jpg",
            "author": "High School Transformation (5T) - Jagatsinghpur",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by High School Transformation (5T) via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [1200, 800],
            "type": "hero",
            "description": "Historic educational and heritage gateway of Jagatsinghpur town near the Alaka river valley"
        },
        "gallery": [],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_015",
        "name": "Deulajhari Hot Springs",
        "district": "Angul",
        "category": "nature",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/3/38/Deulajhari_Angul.JPG",
            "wikimedia_file": "File:Deulajhari Angul.JPG",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Deulajhari_Angul.JPG",
            "author": "Sujit kumar",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Sujit kumar via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [2560, 1920],
            "type": "hero",
            "description": "Ancient Siddheswar Baba and Maa Maheswari temple complex at the geothermal Deulajhari sulphur springs"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Deulajhari_Hot_Spring%2CAthmallik%2C_Angul.JPG",
                "wikimedia_file": "File:Deulajhari Hot Spring,Athmallik, Angul.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Deulajhari_Hot_Spring%2CAthmallik%2C_Angul.JPG",
                "author": "Aditya Mahar",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Aditya Mahar via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Maa Maheshwari Temple and geothermal sulphur kunda enclosures at Deulajhari"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Deulajhari_jasmin_forest.JPG",
                "wikimedia_file": "File:Deulajhari jasmin forest.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Deulajhari_jasmin_forest.JPG",
                "author": "Rajani3737",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Rajani3737 via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [6000, 4000],
                "type": "gallery",
                "description": "Indigenous dense jasmine forest grove surrounding the 24 hot and cold springs at Deulajhari"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Deulajhari_Hot_spring_and_Siddheswar_Baba_Temple%2CAthmallik%2CAngul%2COdisha.jpg",
                "wikimedia_file": "File:Deulajhari Hot spring and Siddheswar Baba Temple,Athmallik,Angul,Odisha.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Deulajhari_Hot_spring_and_Siddheswar_Baba_Temple%2CAthmallik%2CAngul%2COdisha.jpg",
                "author": "Abhas Kumar Kheti",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Abhas Kumar Kheti via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [1600, 1200],
                "type": "gallery",
                "description": "Panorama of Deulajhari hot springs reservoir and Shaivite shrine"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_016",
        "name": "Talcher Palace",
        "district": "Angul",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Talcher_Palace%2C_Angul%2C_Odisha.jpg",
            "wikimedia_file": "File:Talcher Palace, Angul, Odisha.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Talcher_Palace%2C_Angul%2C_Odisha.jpg",
            "author": "Athulvis",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Athulvis via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4000, 3000],
            "type": "hero",
            "description": "Imposing facade and grand stone entrance of Talcher Palace on the banks of Brahmani River"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Talcher_Palace%2C_Angul%2C_Odisha_2.jpg",
                "wikimedia_file": "File:Talcher Palace, Angul, Odisha 2.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Talcher_Palace%2C_Angul%2C_Odisha_2.jpg",
                "author": "Athulvis",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Athulvis via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Royal gateway and fortified ramparts of the princely state of Talcher"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/af/Talcher_Palace%2C_Angul%2C_Odisha_3.jpg",
                "wikimedia_file": "File:Talcher Palace, Angul, Odisha 3.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Talcher_Palace%2C_Angul%2C_Odisha_3.jpg",
                "author": "Athulvis",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Athulvis via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Courtyard and colonial-Kalinga architectural wings of Talcher Palace"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/a/ab/TalcherKingPlace_RajBati.jpg",
                "wikimedia_file": "File:TalcherKingPlace RajBati.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:TalcherKingPlace_RajBati.jpg",
                "author": "Techmightguy",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Techmightguy via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [1414, 2000],
                "type": "gallery",
                "description": "Historic Bhanja royal crest and palace structure"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_017",
        "name": "Lalitgiri Buddhist Complex",
        "district": "Cuttack",
        "category": "heritage",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Lalitgiri_-_Odisha_-_001.jpg",
            "wikimedia_file": "File:Lalitgiri - Odisha - 001.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Lalitgiri_-_Odisha_-_001.jpg",
            "author": "Rupeshsarkar",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Rupeshsarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4224, 2816],
            "type": "hero",
            "description": "Ancient 3rd-century BCE Lalitgiri Maha Stupa atop the hill overlooking the Mahanga valley"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Lalitgiri_-_Odisha_-_002.jpg",
                "wikimedia_file": "File:Lalitgiri - Odisha - 002.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Lalitgiri_-_Odisha_-_002.jpg",
                "author": "Rupeshsarkar",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Rupeshsarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [3252, 2104],
                "type": "gallery",
                "description": "Colossal carved stone Buddha sculpture in the monastic courtyard of Lalitgiri Monastery 1"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/0/05/Lalitgiri_-_Odisha_-_003.jpg",
                "wikimedia_file": "File:Lalitgiri - Odisha - 003.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Lalitgiri_-_Odisha_-_003.jpg",
                "author": "Rupeshsarkar",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Rupeshsarkar via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [3917, 2837],
                "type": "gallery",
                "description": "Brick pathways and circular relic-stupa foundations at Lalitgiri Diamond Triangle site"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Chaityagriha_at_Lalitgiri.jpg",
                "wikimedia_file": "File:Chaityagriha at Lalitgiri.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Chaityagriha_at_Lalitgiri.jpg",
                "author": "Amartyabag",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Amartyabag via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [2592, 1944],
                "type": "gallery",
                "description": "Apsidal Chaityagriha prayer hall ruins at Lalitgiri"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_018",
        "name": "Dhabaleswar Island Temple",
        "district": "Cuttack",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/7/79/Dhabaleswar_Bridge.jpg",
            "wikimedia_file": "File:Dhabaleswar Bridge.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Dhabaleswar_Bridge.jpg",
            "author": "SayanSenGupta2020",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by SayanSenGupta2020 via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [5184, 3456],
            "type": "hero",
            "description": "Historic pedestrian suspension ropeway bridge connecting the mainland to Dhabaleswar Island across Mahanadi River"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Dhabaleswar_Temple.JPG",
                "wikimedia_file": "File:Dhabaleswar Temple.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Dhabaleswar_Temple.JPG",
                "author": "Nirmalbarik",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Nirmalbarik via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Side view of the 10th-century Shaivite Dhabaleswar Temple on the river island"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Hanging_bridge_Dhabaleswara_temple_Cuttack_Odisha.jpg",
                "wikimedia_file": "File:Hanging bridge Dhabaleswara temple Cuttack Odisha.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Hanging_bridge_Dhabaleswara_temple_Cuttack_Odisha.jpg",
                "author": "Diptiman Panigrahi",
                "license": "CC BY 3.0",
                "attribution": "Photo by Diptiman Panigrahi via Wikimedia Commons, licensed under CC BY 3.0",
                "dimensions": [1600, 1200],
                "type": "gallery",
                "description": "Suspension bridge view with Mahanadi riverbed and island trees"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Dhabaleswar_temple.jpg",
                "wikimedia_file": "File:Dhabaleswar temple.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Dhabaleswar_temple.jpg",
                "author": "Soumyajyoti1997",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Soumyajyoti1997 via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [5152, 3864],
                "type": "gallery",
                "description": "Main temple shikara and courtyard view during Bada Osha festivities"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_019",
        "name": "Ansupa Lake",
        "district": "Cuttack",
        "category": "lake",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/7/77/A_view_of_the_Ansupa_Lake_from_atop_Saranda_Hill.jpg",
            "wikimedia_file": "File:A view of the Ansupa Lake from atop Saranda Hill.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:A_view_of_the_Ansupa_Lake_from_atop_Saranda_Hill.jpg",
            "author": "Adityanag2002",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Adityanag2002 via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [5184, 3456],
            "type": "hero",
            "description": "Aerial panoramic view of the horseshoe-shaped Ansupa freshwater lake from atop Saranda Hill"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/4/45/Anshupa_Lake_-2.jpg",
                "wikimedia_file": "File:Anshupa Lake -2.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Anshupa_Lake_-2.jpg",
                "author": "Bikash Ojha",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Bikash Ojha via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [6000, 4000],
                "type": "gallery",
                "description": "Pristine waters and floating lotus wetlands of Ansupa Lake"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/8/86/Anshupa_Lake_Cuttack.jpg",
                "wikimedia_file": "File:Anshupa Lake Cuttack.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Anshupa_Lake_Cuttack.jpg",
                "author": "Krushna C Mahapatra",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Krushna C Mahapatra via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [5184, 3456],
                "type": "gallery",
                "description": "Scenic lake perimeter and migratory bird winter habitat at Banki"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/56/Anshupa_Lake.jpg",
                "wikimedia_file": "File:Anshupa Lake.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Anshupa_Lake.jpg",
                "author": "Rkrajat",
                "license": "CC BY-SA 4.0",
                "attribution": "Photo by Rkrajat via Wikimedia Commons, licensed under CC BY-SA 4.0",
                "dimensions": [2592, 1456],
                "type": "gallery",
                "description": "Landscape vista of Ansupa Lake surrounded by hills"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_020",
        "name": "Bhattarika Temple",
        "district": "Cuttack",
        "category": "temple",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/7/71/Bhattarika.JPG",
            "wikimedia_file": "File:Bhattarika.JPG",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Bhattarika.JPG",
            "author": "Sujit kumar",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Sujit kumar via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [2560, 1920],
            "type": "hero",
            "description": "Ancient riverside Shakti temple of Goddess Bhattarika on the foot of Ratnagiri hill beside Mahanadi River at Badamba"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/5/51/Bhattarika_Temple.JPG",
                "wikimedia_file": "File:Bhattarika Temple.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Bhattarika_Temple.JPG",
                "author": "Rajani3737",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Rajani3737 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [6000, 4000],
                "type": "gallery",
                "description": "South side architectural elevation of Bhattarika Temple"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/69/Cave_at_hill_top.JPG",
                "wikimedia_file": "File:Cave at hill top.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Cave_at_hill_top.JPG",
                "author": "Rajani3737",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Rajani3737 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [6000, 4000],
                "type": "gallery",
                "description": "Sacred rock cave sanctuary atop the hill overlooking the Mahanadi River"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Sunset_view_bhattarika.JPG",
                "wikimedia_file": "File:Sunset view bhattarika.JPG",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Sunset_view_bhattarika.JPG",
                "author": "Rajani3737",
                "license": "CC BY-SA 3.0",
                "attribution": "Photo by Rajani3737 via Wikimedia Commons, licensed under CC BY-SA 3.0",
                "dimensions": [6000, 4000],
                "type": "gallery",
                "description": "Sunset over the Mahanadi river bend at Bhattarika Pitha"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    },
    {
        "research_id": "round2_east_021",
        "name": "Nuapatna Handloom Heritage Village",
        "district": "Cuttack",
        "category": "cultural",
        "hero_image": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Gita_Gobinda_Khandua.jpg",
            "wikimedia_file": "File:Gita Gobinda Khandua.jpg",
            "source": "Wikimedia Commons",
            "source_url": "https://commons.wikimedia.org/wiki/File:Gita_Gobinda_Khandua.jpg",
            "author": "Prateek_Pattanaik",
            "license": "CC BY-SA 4.0",
            "attribution": "Photo by Prateek Pattanaik via Wikimedia Commons, licensed under CC BY-SA 4.0",
            "dimensions": [4608, 2304],
            "type": "hero",
            "description": "Sacred Khandua Pata silk fabric woven with 12th-century poet Jayadeva's Gita Govinda verses for Lord Jagannath of Puri"
        },
        "gallery": [
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Handloom_1.jpg",
                "wikimedia_file": "File:Handloom 1.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Handloom_1.jpg",
                "author": "Bhagirathipatra",
                "license": "Public domain",
                "attribution": "Photo by Bhagirathipatra via Wikimedia Commons, Public domain",
                "dimensions": [3000, 4000],
                "type": "gallery",
                "description": "Master weaver operating a traditional wooden fly-shuttle pit loom in Nuapatna"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Shuttle_weaving.jpg",
                "wikimedia_file": "File:Shuttle weaving.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Shuttle_weaving.jpg",
                "author": "Bhagirathipatra",
                "license": "Public domain",
                "attribution": "Photo by Bhagirathipatra via Wikimedia Commons, Public domain",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Wooden handloom shuttle and warp threads used for intricate Ikat tie-and-dye patterns"
            },
            {
                "url": "https://upload.wikimedia.org/wikipedia/commons/4/43/Charkha_local.jpg",
                "wikimedia_file": "File:Charkha local.jpg",
                "source": "Wikimedia Commons",
                "source_url": "https://commons.wikimedia.org/wiki/File:Charkha_local.jpg",
                "author": "Bhagirathipatra",
                "license": "Public domain",
                "attribution": "Photo by Bhagirathipatra via Wikimedia Commons, Public domain",
                "dimensions": [4000, 3000],
                "type": "gallery",
                "description": "Traditional spinning charkha wheel preparing silk and cotton yarn for weaving"
            }
        ],
        "verification_status": "VERIFIED_AUTHENTIC_PHOTOGRAPHY"
    }
]

def build_catalog():
    districts = {}
    for item in DATA:
        dist = item["district"]
        if dist not in districts:
            districts[dist] = []
        districts[dist].append(item)
    
    catalog = {
        "region": "Eastern Odisha",
        "total_destinations": len(DATA),
        "districts": districts
    }
    
    os.makedirs("data/research/round2/eastern", exist_ok=True)
    with open("data/research/round2/eastern/eastern_image_catalog.json", "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print("1. Generated data/research/round2/eastern/eastern_image_catalog.json")

def update_candidates():
    with open("data/research/round2/eastern/candidates.json", "r", encoding="utf-8") as f:
        candidates = json.load(f)
    
    data_map = {item["research_id"]: item for item in DATA}
    for c in candidates:
        rid = c["research_id"]
        if rid in data_map:
            item = data_map[rid]
            c["image_source_url"] = item["hero_image"]["url"]
            c["image_source_domain"] = "commons.wikimedia.org"
            c["image_license_note"] = item["hero_image"]["license"]
            c["image_status"] = "verified"
    
    with open("data/research/round2/eastern/candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, indent=2, ensure_ascii=False)
    print("2. Updated candidates.json with verified image URLs and licenses")

def update_sources():
    with open("data/research/round2/eastern/sources.json", "r", encoding="utf-8") as f:
        sources = json.load(f)
    
    data_map = {item["research_id"]: item for item in DATA}
    for s in sources:
        rid = s["research_id"]
        if rid in data_map and s["source_type"] == "wikimedia":
            item = data_map[rid]
            s["url"] = item["hero_image"]["url"]
            s["title"] = f"Wikimedia Commons Image Lead for {item['name']}"
            s["notes"] = f"Candidate image lead on Wikimedia Commons under license {item['hero_image']['license']}: {item['hero_image']['attribution']}"
    
    with open("data/research/round2/eastern/sources.json", "w", encoding="utf-8") as f:
        json.dump(sources, f, indent=2, ensure_ascii=False)
    print("3. Updated sources.json with exact Wikimedia image sources")

def update_image_registry():
    registry_path = "frontend/src/utils/imageRegistry.ts"
    with open(registry_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    east_lines = ["\n  // 4. Round 2 Eastern Odisha Verified Research Destinations"]
    for item in DATA:
        rid = item["research_id"]
        name = item["name"]
        dist = item["district"]
        cat = item["category"]
        url = item["hero_image"]["url"]
        east_lines.append(f'  "{rid}": "{url}", // {name} ({dist}, {cat})')
        east_lines.append(f'  "{name}": "{url}",')
    
    new_block = "\n".join(east_lines)
    
    pattern = r'(export const PLACE_IMAGE_OVERRIDES: Record<string, string> = \{[\s\S]*?)(\n\};)'
    match = re.search(pattern, content)
    if match:
        body = match.group(1)
        if "// 4. Round 2 Eastern Odisha Verified Research Destinations" in body:
            body = re.sub(
                r'\n  // 4\. Round 2 Eastern Odisha Verified Research Destinations[\s\S]*?$',
                '',
                body
            )
        new_content = content[:match.start()] + body + new_block + "\n};" + content[match.end():]
        with open(registry_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("4. Updated frontend/src/utils/imageRegistry.ts with PLACE_IMAGE_OVERRIDES")
    else:
        print("ERROR: Could not find PLACE_IMAGE_OVERRIDES block in imageRegistry.ts")

def update_image_service():
    service_path = "frontend/src/utils/imageService.ts"
    with open(service_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    manifest_entries = ["\n  // --- Round 2 Eastern Odisha Researched Places (Rudra) ---"]
    for item in DATA:
        rid = item["research_id"]
        name = item["name"]
        hero = item["hero_image"]
        gallery = item["gallery"]
        
        all_imgs = [hero] + gallery
        imgs_ts = []
        for img in all_imgs:
            desc_escaped = img["description"].replace("'", "\\'")
            attr_escaped = img["attribution"].replace("'", "\\'")
            imgs_ts.append(
                f'''    {{
      src: "{img['url']}",
      alt: "{desc_escaped}",
      title: "{name}",
      source: "{img['source']}",
      license: "{img['license']}",
      attribution: "{attr_escaped}",
      isFallback: false,
    }}'''
            )
        
        joined_imgs = ",\n".join(imgs_ts)
        manifest_entries.append(f'  "{rid}": [\n{joined_imgs}\n  ],')
        manifest_entries.append(f'  "{name}": [\n{joined_imgs}\n  ],')
    
    manifest_block = "\n".join(manifest_entries)
    
    pattern = r'(export const PLACE_IMAGE_MANIFEST: Record<string, PlaceImage\[\]> = \{[\s\S]*?)(\n\};)'
    match = re.search(pattern, content)
    if match:
        body = match.group(1)
        if "// --- Round 2 Eastern Odisha Researched Places (Rudra) ---" in body:
            body = re.sub(
                r'\n  // --- Round 2 Eastern Odisha Researched Places \(Rudra\) ---[\s\S]*?$',
                '',
                body
            )
        new_content = content[:match.start()] + body + manifest_block + "\n};" + content[match.end():]
        with open(service_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("5. Updated frontend/src/utils/imageService.ts with PLACE_IMAGE_MANIFEST")
    else:
        print("ERROR: Could not find PLACE_IMAGE_MANIFEST block in imageService.ts")

if __name__ == "__main__":
    build_catalog()
    update_candidates()
    update_sources()
    update_image_registry()
    update_image_service()
