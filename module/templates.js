export const preloadHandlebarsTemplates = async () => {

  const templatePaths = [
    "systems/shadowrun5e_fr/templates/actor/parts/actor-equipment.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-spellbook.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-skills.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-matrix.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-actions.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-config.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-bio.html",
    "systems/shadowrun5e_fr/templates/actor/parts/actor-social.html",
    "systems/shadowrun5e_fr/templates/item/parts/description.html",
    "systems/shadowrun5e_fr/templates/item/parts/technology.html",
    "systems/shadowrun5e_fr/templates/item/parts/header.html",
    "systems/shadowrun5e_fr/templates/item/parts/ammo.html",
    "systems/shadowrun5e_fr/templates/item/parts/action.html",
    "systems/shadowrun5e_fr/templates/item/parts/damage.html",
    "systems/shadowrun5e_fr/templates/item/parts/opposed.html",
    "systems/shadowrun5e_fr/templates/item/parts/spell.html",
    "systems/shadowrun5e_fr/templates/item/parts/complex_form.html",
    "systems/shadowrun5e_fr/templates/item/parts/weapon.html",
    "systems/shadowrun5e_fr/templates/item/parts/armor.html",
    "systems/shadowrun5e_fr/templates/item/parts/matrix.html",
    "systems/shadowrun5e_fr/templates/item/parts/weapon-mods.html",
    "systems/shadowrun5e_fr/templates/item/parts/sin.html",
    "systems/shadowrun5e_fr/templates/item/parts/contact.html",
    "systems/shadowrun5e_fr/templates/item/parts/lifestyle.html"
  ];

  return loadTemplates(templatePaths);
};
