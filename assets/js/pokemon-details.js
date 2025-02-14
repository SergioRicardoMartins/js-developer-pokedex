function getPokemonNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

function formatHeight(height) {
    return `${height / 10} m`;
}

function formatWeight(weight) {
    return `${weight / 10} kg`;
}

function loadPokemonDetails() {
    const pokemonName = getPokemonNameFromURL();

    if (!pokemonName) {
        document.getElementById('pokemonDetails').innerHTML = "<p>Pokémon não encontrado.</p>";
        return;
    }

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        .then(response => response.json())
        .then(pokemon => {
            document.getElementById('pokemonName').textContent = pokemon.name.toUpperCase();

            const types = pokemon.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join(', ');
            const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');

            const stats = pokemon.stats.map(stat => `
                <p><strong>${stat.stat.name.toUpperCase()}:</strong> ${stat.base_stat}</p>
            `).join('');

            const moves = pokemon.moves.slice(0, 5).map(move => move.move.name).join(', '); // Pegando apenas 5 movimentos

            document.getElementById('pokemonDetails').innerHTML = `
                <img src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}">
                <p><strong>Número:</strong> ${pokemon.id}</p>
                <p><strong>Tipo:</strong> ${types}</p>
                <p><strong>Habilidades:</strong> ${abilities}</p>
                <p><strong>Peso:</strong> ${formatWeight(pokemon.weight)}</p>
                <p><strong>Altura:</strong> ${formatHeight(pokemon.height)}</p>
                <h3>Status Base</h3>
                ${stats}
                <h3>Movimentos</h3>
                <p>${moves}</p>
                <div id="evolutionChain"><h3>Evolução</h3> Carregando...</div>
            `;

            // Mudar o background da página conforme o tipo do Pokémon
            const mainType = pokemon.types[0].type.name; // Pegamos o primeiro tipo como principal
            document.body.className = mainType;

            // Carregar evoluções
            loadEvolutionChain(pokemon.species.url);
        })
        .catch(error => {
            console.error('Erro ao carregar Pokémon:', error);
            document.getElementById('pokemonDetails').innerHTML = "<p>Erro ao carregar Pokémon.</p>";
        });
}

function loadEvolutionChain(speciesUrl) {
    fetch(speciesUrl)
        .then(response => response.json())
        .then(speciesData => {
            return fetch(speciesData.evolution_chain.url);
        })
        .then(response => response.json())
        .then(evolutionData => {
            const evolutionChainDiv = document.getElementById('evolutionChain');
            let evolutionChainHtml = "<p>";

            let evolution = evolutionData.chain;
            while (evolution) {
                evolutionChainHtml += `${evolution.species.name} ➝ `;
                evolution = evolution.evolves_to.length > 0 ? evolution.evolves_to[0] : null;
            }

            evolutionChainHtml = evolutionChainHtml.replace(/➝\s$/, ''); // Remover último "➝"
            evolutionChainDiv.innerHTML = `<h3>Evolução</h3> <p>${evolutionChainHtml}</p>`;
        })
        .catch(error => {
            console.error("Erro ao carregar evolução:", error);
            document.getElementById('evolutionChain').innerHTML = "<p>Não foi possível carregar a evolução.</p>";
        });
}
document.getElementById("backButton").addEventListener("click", function() {
    window.location.href = "index.html"; // Redireciona para a página inicial
});


window.onload = loadPokemonDetails;
