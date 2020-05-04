export class ChummerImportForm extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'chummer-import';
    options.classes = ['shadowrun5e_fr'];
    options.title = 'Chummer/Hero Lab Import';
    options.template = 'systems/shadowrun5e_fr/templates/apps/import.html';
    options.width = 600;
    options.height = "auto";
    return options;
  }

  getData() {
    return {

    };
  }

  activateListeners(html) {

    /**
     * Translate item name according to locale if possible
     * @param item
     * @returns {{name}|*}
     */
    function translateItem(item) {
      const item_name_eng = item.name;

      const itemNameFormatted = item.name.replace(/-/g, " ").replace(/[\[\]()\/:"\s«»]/g, "_");
      item.name = game.i18n.localize(`CHUMMER.${item.type}.${itemNameFormatted}`);
      if (item.name && item.name.includes("CHUMMER")) {
        // No translation defined, use default name (ENG)
        item.name = item_name_eng;
      }

      return item;
    }

    /**
     * Replace basic imported item with item of the same name in library if present
     * @param item
     * @returns {*}
     */
    function replaceItemWithLibraryItem(item) {
      const libraryItem = game.data.items.filter(i => i.name === item.name);
      item = libraryItem.length !== 0 ? libraryItem[0] : item;

      return item;
    }

    /**
     * Computes detailled contact description
     * @param ctc
     * @returns {string}
     */
    function describeContact(ctc){
      let desc = "";
      // Print left/right location if available
      let contactType = ctc.contacttype;
      let sex = ctc.sex;
      let role = ctc.role;
      let metatype = ctc.metatype;
      let age = ctc.age;
      let personalLife = ctc.personallife;
      let preferredPayment = ctc.prefferedpayment;
      let hobbiesVice = ctc.hobbiesvice;

      if(contactType){
        desc += `<p>${contactType}</p><hr>`;
      }

      desc += "<ul>";
      if(sex){
        desc += `<li><b>Sexe</b> : ${sex}</li>`;
      }
      if(role){
        desc += `<li><b>Rôle</b> : ${role}</li>`;
      }
      if(metatype){
        desc += `<li><b>Métatype</b> : ${metatype}</li>`;
      }
      if(age){
        desc += `<li><b>Âge</b> : ${age}</li>`;
      }
      if(personalLife){
        desc += `<li><b>Vie Perso</b> : ${personalLife}</li>`;
      }
      if(preferredPayment){
        desc += `<li><b>Mode de paiement préféré</b> : ${preferredPayment}</li>`;
      }
      if(hobbiesVice){
        desc += `<li><b>Vice/Hobbies</b> : ${hobbiesVice}</li>`;
      }
      desc += "</ul>";

      return desc;
    }

    /**
     * Computes simple cyberware description by looping through children
     * @param cy
     * @returns {string}
     */
    function describeCyberware(cy){
      let desc = "";
      // Print left/right location if available
      let location = cy.location;
      let extra = cy.extra;
      let grade = cy.grade;
      if(location){
        let locDesc = location === "Right" ? "Droite" : "Gauche";
        desc += `<p>${locDesc}</p><hr>`;
      }
      if(extra){
        desc += `<p><b>${extra}</b></p>`;
      }
      if(grade){
        desc += `<p>${cy.grade}</p>`;
      }
      if(cy.children && cy.children.cyberware) {
        desc += "<ul>";
        cy.children.cyberware.forEach(c => {
          if(c.name) {
            desc += `<li>${c.name}`;
            if(c.rating && c.rating > 0){
              desc += ` (Indice ${c.rating})`;
            }
            if(c.extra) {
              desc += ` - ${c.extra}`
            }
            desc += "</li>";
          }
        });
        desc += "</ul>";
      }


      return desc;
    }

    html.find('.submit-chummer-import').click(async event => {
      event.preventDefault();
      let chummerfile = JSON.parse($('.chummer-text').val());
      const weapons = $('.weapons').is(':checked');1
      const armor = $('.armor').is(':checked');
      const cyberware = $('.cyberware').is(':checked');
      const equipment = $('.gear').is(':checked');
      const qualities = $('.qualities').is(':checked');
      const powers = $('.powers').is(':checked');
      const spells = $('.spells').is(':checked');

      console.log(chummerfile);

      const parseAtt = (att) => {
        if (att.toLowerCase() === "bod") {
          return 'body';
        } else if (att.toLowerCase() === "agi") {
          return 'agility';
        } else if (att.toLowerCase() === "rea") {
          return 'reaction';
        } else if (att.toLowerCase() === "str") {
          return 'strength';
        } else if (att.toLowerCase() === "cha") {
          return 'charisma';
        } else if (att.toLowerCase() === "int") {
          return 'intuition';
        } else if (att.toLowerCase() === "log") {
          return 'logic';
        } else if (att.toLowerCase() === "wil") {
          return 'willpower';
        } else if (att.toLowerCase() === "edg") {
          return 'edge';
        } else if (att.toLowerCase() === "mag") {
          return 'magic';
        } else if (att.toLowerCase() === "res") {
          return 'resonance';
        }
      };

      const parseDamage = (val) => {
        const damage = {
          damage: 0,
          type: 'physical',
          radius: 0,
          dropoff: 0
        };
        let split = val.split(',');
        if (split.length > 0) {
          let l = split[0].match(/(\d+)(\w+)/);
          if (l && l[1]) damage.damage = parseInt(l[1]);
          if (l && l[2]) damage.type = l[2] === 'P' ? 'physical' : 'stun';
        }
        for (let i = 1; i < split.length; i++) {
          let l = split[i].match(/(-?\d+)(.*)/);
          if (l && l[2]) {
            if (l[2].toLowerCase().includes('/m')) damage.dropoff = parseInt(l[1]);
            else damage.radius = parseInt(l[1]);
          }
        }
        return damage;
      };

      const getValues = (val) => {
		let l = val.match(/([0-9]+)(?:([0-9]+))*/g);
        return l || ['0'];
      };

	  const getValInParen = (value) => {
		// regex to capture value inside () or single number
		let l = value.match(/([0-9]+)(?:([0-9]+))*/g);
		if (l != null) {
		  return (l.length > 1 ? l[1] : l[0])
		} else {
		  return value;
		}
	  };
	  const getArray = (value) => {
        return Array.isArray(value) ? value : [value];
      };
      const updateData = duplicate(this.object.data);
      const update = updateData.data;
      const items = [];
      let error = "";
      // character info stuff, also techno/magic and essence
      if (chummerfile.characters
          && chummerfile.characters.character) {
        let c = chummerfile.characters.character;
        try {
          if (c.playername) {
            update.player_name = c.playername;
          }
          if (c.alias) {
            update.name = c.alias;
            updateData.name = c.alias;
          }
          if (c.metatype) {
            update.metatype = c.metatype;
          }
          if (c.sex) {
            update.sex = c.sex;
          }
          if (c.age) {
            update.age = c.age;
          }
          if (c.height) {
            update.height = c.height;
          }
          if (c.weight) {
            update.weight = c.weight;
          }
          if (c.calculatedstreetcred) {
            update.street_cred = c.calculatedstreetcred;
          }
          if (c.calculatednotoriety) {
            update.notoriety = c.calculatednotoriety;
          }
          if (c.calculatedpublicawareness) {
            update.public_awareness = c.calculatedpublicawareness;
          }
          if (c.karma) {
            update.karma.value = c.karma;
          }
          if (c.totalkarma) {
            update.karma.max = c.totalkarma;
          }
          if (c.technomancer && c.technomancer.toLowerCase() === "true") {
            update.special = "resonance";
          }
          if ((c.magician && c.magician.toLowerCase() === "true")
            || (c.adept && c.adept.toLowerCase() === 'true')) {
            update.special = "magic";
            let attr = [];
            if (c.tradition && c.tradition.drainattribute
                      && c.tradition.drainattribute.attr) {
              attr = c.tradition.drainattribute.attr;
            } else if (c.tradition && c.tradition.drainattributes) {
              attr = c.tradition.drainattributes.split('+').map(item => item.trim());
            }
            attr.forEach(att => {
              att = parseAtt(att);
              if (att !== 'willpower') update.magic.attribute = att;
            });
          }
          if (c.totaless) {
            if(c.totaless.includes(',')) {
              update.attributes.essence.value = parseFloat(c.totaless.replace(/,/, "."));
            }
            else {
              update.attributes.essence.value = c.totaless;
            }
          }
          if (c.nuyen) {
            update.nuyen = parseInt(c.nuyen.replace(/[,\s]/g, ''));
          }
        } catch (e) {
            error += "Error with character info: " + e + ". ";
        }
        // update attributes
        let atts = chummerfile.characters.character.attributes[1].attribute;
        atts.forEach(att => {
          try {
            const newAtt = parseAtt(att.name_english);
            if (newAtt){
              update.attributes[newAtt].base = parseInt(att.total);
            }

          } catch (e) {
              error += "Error with attributes: " + e + ". ";
          }
        });
        // initiative stuff
        try {
          if (c.initbonus) {
            // not sure if this one is correct
            update.mods.initiative = c.initbonus;
          }
          if (c.initdice) {
            update.mods.initiative_dice = c.initdice - 1;
          }
        } catch (e) {
            error += "Error with initiative: " + e + ". ";
        }
        // skills...
        let skills = c.skills.skill;
        for (let i = 0; i < skills.length; i++) {
          try {
            let s = skills[i];
            if (s.rating > 0 && s.islanguage) {
              let group = "active";
              let skill = null;
              if (s.islanguage && s.islanguage.toLowerCase() === "true") {
                skill = {};
                update.skills.language.value.push(skill);
                group = "language";
              } else if (s.knowledge && s.knowledge.toLowerCase() === "true") {
                skill = {};
                if (s.attribute.toLowerCase() === "int") {
                  update.skills.knowledge.street.value.push(skill);
                }
                if (s.attribute.toLowerCase() === "log") {
                  update.skills.knowledge.professional.value.push(skill);
                }
                group = "knowledge";
              } else {
                // FIXME dirty hack to get english skill from translated name
                // Get key, e.g "SkillBlades"
                let sr5Translations = game.i18n.translations.SR5;
                let skillKey = Object.keys(sr5Translations).find(key => sr5Translations[key] === s.name);
                // Turn it into blades
                let englishSkillName = skillKey.substring(5).toLowerCase();
                // Find related key in actor skills (template.json)
                let actorSkillKey = Object.keys(update.skills.active).find(key => key.replace(/_/sg, "")  === englishSkillName);
                skill = update.skills.active[actorSkillKey];
              }
              if (!skill) console.error("Couldn't parse skill " + s.name);
              if (skill) {
                if (group !== 'active') skill.name = s.name;
                skill.base = parseInt(s.rating);
                if (s.skillspecializations) {
                  let spec = getArray(s.skillspecializations.skillspecialization.name);
                  skill.specs = spec.join('/');
                }
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
        // qualities
        if (qualities && c.qualities && c.qualities.quality) {
            let qualities = getArray(c.qualities.quality);
            qualities.forEach(q => {
              try {
                const data = {};
                data.type = q.qualitytype.toLowerCase();
                if (q.description) data.description = {
                  value: TextEditor.enrichHTML(q.description)
                };

                const itemData = { name: q.name, type: 'quality', data: data };
                items.push(itemData);
              } catch (e) {
                console.error(e);
              }
            });
        }
        // weapons
        if (weapons && c.weapons != null && c.weapons.weapon != null) {
          let weapons = getArray(c.weapons.weapon);
          weapons.forEach(w => {
            try {
              const data = {};
              const action = {};
              const damage = {};
              action.damage = damage;
              data.action = action;

              if (w.description) {
                data.description = {
                  value: TextEditor.enrichHTML(w.description)
                };
              }

              damage.ap = {
                base: parseInt(getValues(w.ap)[0])
              };
              action.type = 'varies';
              if (w.skill) action.skill = w.skill.toLowerCase().replace(/\s/g, "_");
              else if (w.category && w.category.toLowerCase().includes('exotic')) action.skill = w.category.toLowerCase().replace(' weapons', '').replace(/\s/g, '_');
              if (action.skill.includes('exotic')) action.skill = action.skill.replace('_weapon', '');
              action.attribute = 'agility';
              action.limit = {
                base: parseInt(getValues(w.accuracy)[0])
              };
              action.opposed = {
                type: 'defense'
              };

              if (w.type.toLowerCase() === "melee") {
                action.type = 'complex';
                data.category = 'melee';
                const melee = {};
                data.melee = melee;
                melee.reach = parseInt(w.reach);
              } else if (w.type.toLowerCase() === "ranged") {
                data.category = 'range';
                if (w.skill.toLowerCase().includes('throw')) data.category = 'thrown'; // TODO clean this up
                const range = {};
                data.range = range;
                range.rc = {
                  base: parseInt(getValues(w.rc)[0])
                };
                if (w.mode) { // HeroLab export doesn't have mode
                  let lower = w.mode.toLowerCase();
                  range.modes = {
                    single_shot: lower.includes('ss'),
                    semi_auto: lower.includes('sa'),
                    burst_fire: lower.includes('bf'),
                    full_auto: lower.includes('fa')
                  }
                }
                if (w.clips != null && w.clips.clip != null) { // HeroLab export doesn't have clips
                  let clips = Array.isArray(w.clips.clip) ? w.clips.clip : [w.clips.clip];
                  clips.forEach(clip => {
                    console.log(clip);
                  });
                }
                if (w.ranges
                    && w.ranges.short
                    && w.ranges.medium
                    && w.ranges.long
                    && w.ranges.extreme) {
                  console.log(w.ranges);
                  range.ranges = {
                    short: parseInt(w.ranges.short.split('-')[1]),
                    medium: parseInt(w.ranges.medium.split("-")[1]),
                    long: parseInt(w.ranges.long.split("-")[1]),
                    extreme: parseInt(w.ranges.extreme.split("-")[1])
                  };
                }
                if (w.accessories && w.accessories.accessory) {
                  range.mods = [];
                  let accessories = getArray(w.accessories.accessory);
                  accessories.forEach(a => {
                    if (a) {
                      range.mods.push({
                        name: a.name
                      });
                    }
                  });
                }
              } else if (w.type.toLowerCase() === 'thrown') {
                data.category = 'thrown';
              }
              {
                // TODO handle raw damage if present
                let d = parseDamage(w.damage_english);
                damage.base = d.damage;
                damage.type = d.type;
                if (d.dropoff || d.radius) {
                  const thrown = {};
                  data.thrown = thrown;
                  thrown.blast = {
                    radius: d.radius,
                    dropoff: d.dropoff
                  };
                }
              }

              let itemData = {name: w.name, type: 'weapon', data: data};
              // Attempt to translate item name
              if (game.i18n.lang === "fr") {
                itemData = translateItem(itemData);
                itemData = replaceItemWithLibraryItem(itemData);
              }
              items.push(itemData);
            } catch (e) {
                console.error(e);
            }
          });
        }
        // armors
        if (armor && c.armors && c.armors.armor) {
          let armors = getArray(c.armors.armor);
          armors.forEach(a => {
            try {
              const data = {};
              const armor = {};
              data.armor = armor;

              let desc = "";
              armor.mod = a.armor.includes("+");
              armor.value = parseInt(a.armor.replace("+", ""));
              if (a.description) desc = a.description;

              console.log(a);
              if (a.armormods && a.armormods.armormod) {
                armor.fire = 0;
                armor.electricity = 0;
                armor.cold = 0;
                armor.acid = 0;
                armor.radiation = 0;

                let modDesc = [];
                let mods = getArray(a.armormods.armormod);
                mods.forEach(mod => {
                  if (mod.name.toLowerCase().includes("fire resistance")) {
                    armor.fire += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("nonconductivity")) {
                    armor.electricity += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("insulation")) {
                    armor.cold += parseInt(mod.rating);
                  } else if (mod.name.toLowerCase().includes("radiation shielding")) {
                    armor.radiation += parseInt(mod.rating);
                  }
                  if (mod.rating != "") {
                    modDesc.push(mod.name + " R" + mod.rating);
                  } else {
                    modDesc.push(mod.name);
                  }
                });
                if (modDesc.length > 0) {
                  // add desc to beginning
                  desc = modDesc.join(",") + "\n\n" + desc;
                }
              }
              if (a.equipped.toLowerCase() === "true") {
                data.technology = {
                  equipped: true
                };
              }
              data.description = {
                value: TextEditor.enrichHTML(desc)
              };

              const itemData = { name: a.name, type: 'armor', data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
          });
        }
        // cyberware
		if (cyberware && c.cyberwares && c.cyberwares.cyberware) {
		  let cyberwares = getArray(c.cyberwares.cyberware);
          cyberwares.forEach(cy => {
            try {
              const data = {};
              data.description = {
                rating: cy.rating,
                value: describeCyberware(cy)
              };
              data.technology = {
                rating: cy.rating ? cy.rating : 1,
                equipped: true
              };
              data.essence = parseFloat(cy.ess.replace(/,/, "."));
              data.grade = cy.grade;
              const itemData = { name: cy.name, type: 'cyberware', data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
		  });
		}
        // powers
        if (powers && c.powers && c.powers.power) {
          let powers = getArray(c.powers.power);
          powers.forEach(p => {
            const data = {};
            if (p.description) data.description = {
              value: TextEditor.enrichHTML(p.description)
            };
            data.level = parseInt(p.rating);
            p.pp = parseInt(p.totalpoints);

            const itemData = { name: p.name, type: 'adept_power', data: data };
            items.push(itemData);
          });
        }
        // gear
        if (equipment && c.gears && c.gears.gear) {
          let gears = getArray(c.gears.gear);
          let licenses = [];
          gears.forEach(g => {
            try {
              let gType = 'equipment';
              const data = {};
              let name = g.name;
              if (g.extra) name += ` (${g.extra})`;
              if(g.iscommlink && (g.iscommlink.toLowerCase() === "true")) {
                gType = 'device';
                // TODO Add proper device
                data.technology = {
                  rating: parseInt(g.devicerating) || 1,
                  quantity: g.qty
                };

                if(g.category_english === "Cyberdecks") {
                  data.category = "cyberdeck";

                  data.atts = {
                    "att1": {
                      "value": parseInt(g.attack) || 1,
                          "att": "attack"
                    },
                    "att2": {
                      "value": parseInt(g.sleaze) || 1,
                          "att": "sleaze"
                    },
                    "att3": {
                      "value": parseInt(g.dataprocessing) || 1,
                          "att": "data_processing"
                    },
                    "att4": {
                      "value": parseInt(g.firewall) || 1,
                          "att": "firewall"
                    }
                  };
                }
              }
              else {
                data.technology = {
                  rating: g.rating,
                  quantity: g.qty
                };
              }
              data.description = {
                value: g.description
              };
              const itemData = { name: name, type: gType, data: data };
              items.push(itemData);
            } catch (e) {
              console.error(e);
            }
          });
        }
        // spells
        if (spells && c.spells && c.spells.spell) {
          let spells = getArray(c.spells.spell);
          spells.forEach(s => {
            try {
              if (s.alchemy.toLowerCase() !== "true") {
                const action = {};
                const data = {};
                data.action = action;
                data.category = s.category.toLowerCase().replace(/\s/g, '_');
                data.name = s.name;
                data.type = s.type === 'M' ? 'mana' : 'physical';
                data.range = s.range === 'T' ? 'touch' : s.range.toLowerCase().replace(/\s/g, '_').replace('(','').replace(')','');
                data.drain = parseInt(s.dv.replace("F", ""));
                let description = "";
                if (s.descriptors) description = s.descriptors;
                if (s.description) description += '\n' + s.description;
                data.description = {};
                data.description.value = TextEditor.enrichHTML(description);

                if (s.duration.toLowerCase() === "s") data.duration = "sustained";
                else if (s.duration.toLowerCase() === "i") data.duration = "instant";
                else if (s.duration.toLowerCase() === "p") data.duration = "permanent";

                action.type = 'varies';
                action.skill = 'spellcasting';
                action.attribute = 'magic';

                if (s.descriptors) {
                  let desc = s.descriptors.toLowerCase();
                  if (s.category.toLowerCase() === "combat") {
                    data.combat = {};
                    if (desc.includes('direct')) {
                      data.combat.type = 'indirect';
                      action.opposed = {
                        type: 'defense'
                      };
                    } else {
                      data.combat.type = 'direct';
                      if (data.type === 'mana') {
                        action.opposed = {
                          type: 'custom',
                          attribute: 'willpower'
                        };
                      } else if (data.type === 'physical') {
                        action.opposed = {
                          type: 'custom',
                          attribute: 'body'
                        };
                      }
                    }
                  }
                  if (s.category.toLowerCase() === 'detection') {
                    data.detection = {};
                    let split = desc.split(',');
                    split.forEach(token => {
                      token = token || '';
                      token = token.replace(' detection spell', '');
                      if (!token) return;
                      if (token.includes('area')) return;

                      if (token.includes('passive')) data.detection.passive = true;
                      else if (token.includes('active')) data.detection.passive = false;
                      else if (token) data.detection.type = token.toLowerCase();
                    });
                    if (!data.detection.passive) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      }
                    }
                  }
                  if (s.category.toLowerCase() === 'illusion') {
                    data.illusion = {};
                    let split = desc.split(',');
                    split.forEach(token => {
                      token = token || '';
                      token = token.replace(' illusion spell', '');
                      if (!token) return;
                      if (token.includes('area')) return;

                      if (token.includes('sense')) data.illusion.sense = token.toLowerCase();
                      else if (token) data.illusion.type = token.toLowerCase();
                    });
                    if (data.type === 'mana') {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      };
                    } else {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'intuition',
                        attribute2: 'logic'
                      }
                    }
                  }
                  if (s.category.toLowerCase() === "manipulation") {
                    data.manipulation = {};
                    if (desc.includes('environmental')) data.manipulation.environmental = true;
                    if (desc.includes('physical')) data.manipulation.physical = true;
                    if (desc.includes('mental')) data.manipulation.mental = true;
                    // TODO figure out how to parse damaging

                    if (data.manipulation.mental) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'willpower',
                        attribute2: 'logic'
                      };
                    }
                    if (data.manipulation.physical) {
                      action.opposed = {
                        type: 'custom',
                        attribute: 'body',
                        attribute2: 'strength'
                      };
                    }
                  }
                }
                const itemData = { name: s.name, type: 'spell', data: data };
                items.push(itemData);
              }
            } catch (e) {
              console.error(e);
            }
          });
        }

        // BIO/SIN/Contacts
        //TODO Make import tickable
        if(c.contacts && c.contacts.contact) {
          let contacts = getArray(c.contacts.contact);
          contacts.forEach(ctc => {
            let data = {};
            data.type = ctc.contacttype || "";
            data.connection = ctc.connection || 1;
            data.loyalty = ctc.loyalty || 1;
            data.description = { value : describeContact(ctc) };
            const itemData = { name: ctc.name, type: 'contact', data: data};
            items.push(itemData);
          })
        }
        // TODO SINs & Lifestyles

      }
      await this.object.update(updateData);
      await this.object.createManyEmbeddedEntities("OwnedItem", items);
      ui.notifications.info('Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;');
      this.close();
    });
  }
}
