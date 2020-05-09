/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { ActorFFG } from "./actors/actor-ffg.js";
import { ItemSheetFFG } from "./items/item-sheet-ffg.js";
import { CharacterSheetFFG } from "./actors/character-sheet-ffg.js";
import { MinionSheetFFG } from "./actors/minion-sheet-ffg.js";
import { VehicleSheetFFG } from "./actors/vehicle-sheet-ffg.js";
import { DicePoolFFG } from "./dice-pool-ffg.js";
import { CombatFFG } from "./combat-ffg.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing SWFFG System`);

  // Place our classes in their own namespace for later reference.
   game.ffg = {
     ActorFFG,
     CombatFFG
   };


  // Define custom Entity classes. This will override the default Actor
  // to instead use our extended version.
  CONFIG.Actor.entityClass = ActorFFG;
  CONFIG.Combat.entityClass = CombatFFG;
  console.log(CombatFFG);

  // TURN ON OR OFF HOOK DEBUGGING
  CONFIG.debug.hooks = false;

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
   // Register initiative rule
   game.settings.register("starwarsffg", "initiativeRule", {
     name: "Initiative Type",
     hint: "Choose between Vigilance or Cool for Initiative rolls.",
     scope: "world",
     config: true,
     default: "v",
     type: String,
     choices: {
       "v": "Use Vigilance",
       "c": "Use Cool",
     },
     onChange: rule => _setffgInitiative(rule)
   });
   _setffgInitiative(game.settings.get("starwarsffg", "initiativeRule"));


   function _setffgInitiative(initMethod)
   {
     let formula;
     switch (initMethod)
     {
       case "v":
       formula = "@_rollSkillManual(@skills.Vigilance.rank, @characteristics.Willpower.value, 0)";
       break;

       case "c":
       formula = "@_rollSkillManual(@skills.Cool.rank, @characteristics.Presence.value, 0)";
       break;
     }

     CONFIG.Combat.initiative = {
       // formula: formula,
       formula: "1d20",
       decimals: 0
     }
   }

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ffg", CharacterSheetFFG, {
    types: ["character"],
    makeDefault: true
  });
  Actors.registerSheet("ffg", MinionSheetFFG, {
    types: ["minion"],
    makeDefault: true
  });
  Actors.registerSheet("ffg", VehicleSheetFFG, {
    types: ["vehicle"],
    makeDefault: true
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("ffg", ItemSheetFFG, {makeDefault: true});

  // Add utilities to the global scope, this can be useful for macro makers
  window.DicePoolFFG = DicePoolFFG;

  // Register Handlebars utilities
  Handlebars.registerHelper("json", JSON.stringify);

  // Allows {if X = Y} type syntax in html using handlebars
  Handlebars.registerHelper('iff', function (a, operator, b, opts) {
    var bool = false;
    switch (operator) {
      case '==':
        bool = a == b;
        break;
      case '>':
        bool = a > b;
        break;
      case '<':
        bool = a < b;
        break;
      case '!=':
        bool = a != b;
        break;
      default:
        throw "Unknown operator " + operator;
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });
});
