const util = require("util");
const { exec } = require("child_process");

/**
 * Permet d'exécuter des commandes shell ($) ou du code JS (>)
 * Accessible uniquement aux utilisateurs premium (prenium_id).
 */
async function eval_exec(
  sock,
  {
    prenium_id,
    texte,
    repondre
  }
) {
  if (!prenium_id || !texte) return;

  // Exécution d'une commande shell
  if (texte.startsWith("$")) {
    const cmd = texte.slice(1); // on enlève le $
    await new Promise(resolve => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          repondre("Erreur d'exécution :\n" + err.message).then(resolve);
        } else if (stderr) {
          repondre("Erreur :\n" + stderr).then(resolve);
        } else {
          const output = stdout || "Commande exécutée sans sortie.";
          repondre(output).then(resolve);
        }
      });
    });
  }

  // Exécution de code JavaScript
  else if (texte.startsWith(">")) {
    const code = texte.slice(1); // on enlève le >
    try {
      let result;
      const wrapped = `(async () => { return ${code} })()`;

      try {
        result = await eval(wrapped);
      } catch {
        result = await eval(`(async () => { ${code} })()`);
      }

      if (typeof result === "undefined") {
        return await repondre("undefined");
      }

      const output =
        typeof result === "object"
          ? util.inspect(result, { depth: 1 })
          : result.toString();

      await repondre(output);
    } catch (err) {
      const errorMsg = util.inspect(err, { depth: 1 });
      await repondre("Erreur dans le code JS:\n" + errorMsg);
    }
  }
}

module.exports = eval_exec;
